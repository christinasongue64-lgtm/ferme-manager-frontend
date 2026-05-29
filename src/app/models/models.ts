// ========== AUTH ==========
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'employee';
  phone?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  role: string;
  phone?: string;
}

// ========== ANIMALS ==========
export interface Animal {
  id?: number;
  identifier?: string;
  name?: string;
  animal_type: string;
  animal_type_display?: string;
  breed?: string;
  sex: string;
  sex_display?: string;
  birth_date?: string;
  entry_date: string;
  entry_type: string;
  entry_type_display?: string;
  status: string;
  status_display?: string;
  weight?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// ========== HEALTH ==========
export interface HealthRecord {
  id?: number;
  animal: number;
  animal_name?: string;
  record_type: string;
  record_type_display?: string;
  date: string;
  description: string;
  medication?: string;
  dose?: string;
  veterinarian?: string;
  cost: number;
  next_date?: string;
  notes?: string;
  created_at?: string;
}

// ========== STOCK ==========
export interface StockItem {
  id?: number;
  name: string;
  category: string;
  category_display?: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  unit_price: number;
  supplier?: string;
  expiry_date?: string;
  notes?: string;
  is_low?: boolean;
  total_value?: number;
  updated_at?: string;
}

export interface StockMovement {
  id?: number;
  item: number;
  item_name?: string;
  movement_type: string;
  movement_type_display?: string;
  quantity: number;
  date: string;
  reason?: string;
  created_at?: string;
}

// ========== SALES ==========
export interface Sale {
  id?: number;
  animal?: number;
  animal_identifier?: string;
  client_name: string;
  client_phone?: string;
  date: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  description: string;
  notes?: string;
  created_at?: string;
}

// ========== FINANCE ==========
export interface Expense {
  id?: number;
  category: string;
  category_display?: string;
  description: string;
  amount: number;
  date: string;
  supplier?: string;
  notes?: string;
  created_at?: string;
}

// ========== DASHBOARD ==========
export interface DashboardStats {
  total_animals: number;
  animals_by_type: { animal_type: string; count: number }[];
  low_stock_count: number;
  monthly_revenue: number;
  monthly_expense_total: number;
  monthly_profit: number;
  monthly_sales_count: number;
  upcoming_vaccines: number;
}
