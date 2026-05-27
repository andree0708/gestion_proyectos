export interface JwtPayload {
  userId: string;
  orgId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface RegisterDto {
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

export interface LoginDto {
  email: string;
  password: string;
}