export interface User {
  id: string;
  orgId: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export interface Organization {
  id: string;
  name: string;
  taxId: string;
  country: string;
  sector: string;
  department?: string;
  city?: string;
  address?: string;
  kybStatus: 'pending' | 'approved' | 'rejected';
  plan: 'free' | 'premium';
}

export interface AuthResponse {
  user: User;
  organization: Organization;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  taxId: string;
  country: string;
  sector: string;
  department: string;
  city: string;
  address?: string;
  email: string;
  password: string;
  fullName: string;
}