import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../config/api.config";
import {
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
  User,
  Bike,
  BikeCreate,
  Expense,
  ExpenseCreate,
  DashboardStats,
  BrandModelsMap,
} from "../types";

const API_BASE_URL = `${API_CONFIG.BACKEND_URL}${API_CONFIG.API_PREFIX}`;

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Auth APIs
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/auth/signup",
      credentials
    );
    return response.data;
  }

  async updateName(name: string): Promise<User> {
    const response = await this.client.put<User>("/auth/update-name", { name });
    return response.data;
  }

  async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await this.client.put<{ message: string }>(
      "/auth/update-password",
      {
        current_password: currentPassword,
        new_password: newPassword,
      }
    );
    return response.data;
  }

  // Bike APIs
  async getBikes(): Promise<Bike[]> {
    const response = await this.client.get<Bike[]>("/bikes");
    return response.data;
  }

  async createBike(bike: BikeCreate): Promise<Bike> {
    const response = await this.client.post<Bike>("/bikes", bike);
    return response.data;
  }

  async updateBike(id: string, bike: Partial<BikeCreate>): Promise<Bike> {
    const response = await this.client.put<Bike>(`/bikes/${id}`, bike);
    return response.data;
  }

  async deleteBike(id: string): Promise<void> {
    await this.client.delete(`/bikes/${id}`);
  }

  // Expense APIs
  async getExpenses(filters?: {
    bike_id?: string;
    type?: string;
    search?: string;
  }): Promise<Expense[]> {
    const response = await this.client.get<Expense[]>("/expenses", {
      params: filters,
    });
    return response.data;
  }

  async createExpense(expense: ExpenseCreate): Promise<Expense> {
    const response = await this.client.post<Expense>("/expenses", expense);
    return response.data;
  }

  async updateExpense(
    id: string,
    expense: Partial<ExpenseCreate>
  ): Promise<Expense> {
    const response = await this.client.put<Expense>(`/expenses/${id}`, expense);
    return response.data;
  }

  async deleteExpense(id: string): Promise<void> {
    await this.client.delete(`/expenses/${id}`);
  }

  // Dashboard API
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>("/dashboard/stats");
    return response.data;
  }

  // Master Data APIs
  async getBikeBrands(): Promise<string[]> {
    const response = await this.client.get<string[]>("/master/brands");
    return response.data;
  }

  async getBikeModels(): Promise<string[]> {
    const response = await this.client.get<string[]>("/master/models");
    return response.data;
  }

  async getBrandsWithModels(): Promise<BrandModelsMap> {
    const response = await this.client.get<BrandModelsMap>(
      "/master/brands-models"
    );
    return response.data;
  }

  async getExpenseTypes(): Promise<string[]> {
    const response = await this.client.get<string[]>("/master/expense-types");
    return response.data;
  }
}

export default new ApiService();
