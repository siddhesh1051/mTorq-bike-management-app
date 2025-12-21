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
  brand?: string;
  model: string;
  registration?: string;
  image_url?: string;
  created_at: string;
}

export interface BikeCreate {
  brand: string;
  model: string;
  registration?: string;
  image_url?: string;
}

export type ExpenseType =
  | "Fuel"
  | "Service"
  | "Insurance"
  | "PUC"
  | "Tyres"
  | "Battery"
  | "Spare Parts"
  | "Repair"
  | "Accessories"
  | "Gear"
  | "Modification"
  | "Toll"
  | "Parking"
  | "Washing"
  | "Registration/RTO"
  | "Fines/Challan"
  | "EMI"
  | "Other";

export interface Expense {
  id: string;
  user_id: string;
  bike_id: string;
  type: ExpenseType;
  amount: number;
  date: string;
  odometer?: number;
  notes?: string;
  // Fuel-specific fields
  litres?: number;
  is_full_tank?: boolean;
  price_per_litre?: number;
  created_at: string;
}

export interface ExpenseCreate {
  bike_id: string;
  type: string;
  amount: number;
  date: string;
  odometer?: number;
  notes?: string;
  // Fuel-specific fields (optional, only used for Fuel type)
  litres?: number;
  is_full_tank?: boolean;
  price_per_litre?: number;
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

// Document types
export type DocumentType =
  | "RC Certificate"
  | "Insurance Policy"
  | "PUC Certificate"
  | "Driver's License"
  | "Service Records"
  | "Warranty Documents"
  | "Other";

export interface Document {
  id: string;
  user_id: string;
  bike_id: string;
  document_type: DocumentType;
  custom_name?: string;
  file_url: string;
  public_id: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

export interface DocumentCreate {
  bike_id: string;
  document_type: string;
  file_url: string;
  public_id: string;
  file_name: string;
  file_size: number;
  custom_name?: string;
}
