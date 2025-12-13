#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class BikeExpenseAPITester:
    def __init__(self, base_url="https://bikebudget.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_user_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        self.test_user_password = "TestPass123!"
        self.test_user_name = "Test User"
        
        self.created_bike_id = None
        self.created_expense_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def make_request(self, method, endpoint, data=None, auth_required=True):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            
            return response
        except Exception as e:
            print(f"Request failed: {str(e)}")
            return None

    def test_user_signup(self):
        """Test user registration"""
        data = {
            "email": self.test_user_email,
            "password": self.test_user_password,
            "name": self.test_user_name
        }
        
        response = self.make_request('POST', '/auth/signup', data, auth_required=False)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'access_token' in response_data and 'user' in response_data:
                self.token = response_data['access_token']
                self.user_data = response_data['user']
                self.log_test("User Signup", True)
                return True
            else:
                self.log_test("User Signup", False, "Missing token or user data in response")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("User Signup", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_user_login(self):
        """Test user login"""
        data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        response = self.make_request('POST', '/auth/login', data, auth_required=False)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'access_token' in response_data:
                self.token = response_data['access_token']
                self.log_test("User Login", True)
                return True
            else:
                self.log_test("User Login", False, "Missing access token")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("User Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_create_bike(self):
        """Test bike creation"""
        data = {
            "name": "Test Bike",
            "model": "Test Model 2024",
            "registration": "DL-01-TEST-1234"
        }
        
        response = self.make_request('POST', '/bikes', data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'id' in response_data:
                self.created_bike_id = response_data['id']
                self.log_test("Create Bike", True)
                return True
            else:
                self.log_test("Create Bike", False, "Missing bike ID in response")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Create Bike", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_bikes(self):
        """Test getting bikes list"""
        response = self.make_request('GET', '/bikes')
        
        if response and response.status_code == 200:
            bikes = response.json()
            if isinstance(bikes, list) and len(bikes) > 0:
                self.log_test("Get Bikes", True)
                return True
            else:
                self.log_test("Get Bikes", False, "No bikes returned or invalid format")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get Bikes", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_update_bike(self):
        """Test bike update"""
        if not self.created_bike_id:
            self.log_test("Update Bike", False, "No bike ID available")
            return False
            
        data = {
            "name": "Updated Test Bike",
            "model": "Updated Model 2024"
        }
        
        response = self.make_request('PUT', f'/bikes/{self.created_bike_id}', data)
        
        if response and response.status_code == 200:
            self.log_test("Update Bike", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Update Bike", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_create_expense(self):
        """Test expense creation"""
        if not self.created_bike_id:
            self.log_test("Create Expense", False, "No bike ID available")
            return False
            
        data = {
            "bike_id": self.created_bike_id,
            "type": "Fuel",
            "amount": 500.50,
            "date": datetime.now().strftime('%Y-%m-%d'),
            "odometer": 15000,
            "notes": "Test fuel expense"
        }
        
        response = self.make_request('POST', '/expenses', data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'id' in response_data:
                self.created_expense_id = response_data['id']
                self.log_test("Create Expense", True)
                return True
            else:
                self.log_test("Create Expense", False, "Missing expense ID in response")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Create Expense", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_expenses(self):
        """Test getting expenses list"""
        response = self.make_request('GET', '/expenses')
        
        if response and response.status_code == 200:
            expenses = response.json()
            if isinstance(expenses, list):
                self.log_test("Get Expenses", True)
                return True
            else:
                self.log_test("Get Expenses", False, "Invalid expenses format")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get Expenses", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_get_expenses_with_filters(self):
        """Test getting expenses with filters"""
        # Test type filter
        response = self.make_request('GET', '/expenses?type=Fuel')
        
        if response and response.status_code == 200:
            self.log_test("Get Expenses with Type Filter", True)
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get Expenses with Type Filter", False, f"Status: {response.status_code if response else 'None'}")
            
        # Test bike filter
        if self.created_bike_id:
            response = self.make_request('GET', f'/expenses?bike_id={self.created_bike_id}')
            
            if response and response.status_code == 200:
                self.log_test("Get Expenses with Bike Filter", True)
                return True
            else:
                self.log_test("Get Expenses with Bike Filter", False, f"Status: {response.status_code if response else 'None'}")
                return False
        else:
            self.log_test("Get Expenses with Bike Filter", False, "No bike ID available")
            return False

    def test_update_expense(self):
        """Test expense update"""
        if not self.created_expense_id:
            self.log_test("Update Expense", False, "No expense ID available")
            return False
            
        data = {
            "amount": 600.75,
            "notes": "Updated test expense"
        }
        
        response = self.make_request('PUT', f'/expenses/{self.created_expense_id}', data)
        
        if response and response.status_code == 200:
            self.log_test("Update Expense", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Update Expense", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        response = self.make_request('GET', '/dashboard/stats')
        
        if response and response.status_code == 200:
            stats = response.json()
            required_fields = ['total_expenses', 'category_breakdown', 'recent_expenses', 'total_bikes']
            
            if all(field in stats for field in required_fields):
                self.log_test("Dashboard Stats", True)
                return True
            else:
                missing_fields = [field for field in required_fields if field not in stats]
                self.log_test("Dashboard Stats", False, f"Missing fields: {missing_fields}")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Dashboard Stats", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_delete_expense(self):
        """Test expense deletion"""
        if not self.created_expense_id:
            self.log_test("Delete Expense", False, "No expense ID available")
            return False
            
        response = self.make_request('DELETE', f'/expenses/{self.created_expense_id}')
        
        if response and response.status_code == 200:
            self.log_test("Delete Expense", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Delete Expense", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_delete_bike(self):
        """Test bike deletion (should also delete associated expenses)"""
        if not self.created_bike_id:
            self.log_test("Delete Bike", False, "No bike ID available")
            return False
            
        response = self.make_request('DELETE', f'/bikes/{self.created_bike_id}')
        
        if response and response.status_code == 200:
            self.log_test("Delete Bike", True)
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Delete Bike", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return False

    def test_auth_protection(self):
        """Test that protected endpoints require authentication"""
        # Save current token
        original_token = self.token
        self.token = None
        
        # Try to access protected endpoint without token
        response = self.make_request('GET', '/bikes')
        
        if response and response.status_code == 403:
            self.log_test("Auth Protection", True)
            success = True
        else:
            self.log_test("Auth Protection", False, f"Expected 403, got {response.status_code if response else 'None'}")
            success = False
            
        # Restore token
        self.token = original_token
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Bike Expense Tracker API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Authentication tests
        if not self.test_user_signup():
            print("❌ Signup failed, stopping tests")
            return False
            
        if not self.test_user_login():
            print("❌ Login failed, stopping tests")
            return False
        
        # Bike management tests
        self.test_create_bike()
        self.test_get_bikes()
        self.test_update_bike()
        
        # Expense management tests
        self.test_create_expense()
        self.test_get_expenses()
        self.test_get_expenses_with_filters()
        self.test_update_expense()
        
        # Dashboard tests
        self.test_dashboard_stats()
        
        # Cleanup tests
        self.test_delete_expense()
        self.test_delete_bike()
        
        # Security tests
        self.test_auth_protection()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            failed_tests = [test for test in self.test_results if not test['success']]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['name']}: {test['details']}")
            return False

def main():
    tester = BikeExpenseAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())