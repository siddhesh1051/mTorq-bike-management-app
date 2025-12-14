export interface User {
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface Bike {
  id: string;
  user_id: string;
  name: string;
  brand?: string;
  model: string;
  registration: string;
  created_at: string;
}

export interface BikeCreate {
  name: string;
  brand: string;
  model: string;
  registration: string;
}

export type ExpenseType = 'Fuel' | 'Service' | 'Insurance' | 'Accessories' | 'Spare Parts' | 'Tyres' | 'Battery' | 'Toll' | 'Parking' | 'Washing' | 'Other';

export interface Expense {
  id: string;
  user_id: string;
  bike_id: string;
  type: ExpenseType;
  amount: number;
  date: string;
  odometer?: number;
  notes?: string;
  created_at: string;
}

export interface ExpenseCreate {
  bike_id: string;
  type: string;
  amount: number;
  date: string;
  odometer?: number;
  notes?: string;
}

export interface DashboardStats {
  total_expenses: number;
  category_breakdown: Record<string, number>;
  recent_expenses: Expense[];
  total_bikes: number;
}

export interface BrandModelsMap {
  [brand: string]: string[];
}

export interface MasterData {
  brands: string[];
  models: string[];
  brandsModels: BrandModelsMap;
  expenseTypes: string[];
}
