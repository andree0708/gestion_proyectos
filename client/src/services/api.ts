import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterData } from '../types/auth';
import { Listing, CreateListingDto, Category } from '../types/listing';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginCredentials) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
  refresh: (refreshToken: string) => api.post<{ accessToken: string }>('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
};

export const listingApi = {
  create: (data: CreateListingDto) => api.post<Listing>('/listings', data),
  getMy: () => api.get<Listing[]>('/listings/my'),
  getById: (id: string) => api.get<Listing>(`/listings/${id}`),
  update: (id: string, data: Partial<CreateListingDto>) => api.put<Listing>(`/listings/${id}`, data),
  delete: (id: string) => api.delete(`/listings/${id}`),
  publish: (id: string) => api.post<Listing>(`/listings/${id}/publish`, {}),
  uploadPhotos: (formData: FormData) => api.post<{ urls: string[] }>('/listings/upload/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadTechnicalSheet: (formData: FormData) => api.post<{ url: string }>('/listings/upload/technical-sheet', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const categoryApi = {
  getAll: () => api.get<Category[]>('/categories'),
  getById: (id: string) => api.get<Category>(`/categories/${id}`),
  seed: () => api.post('/categories/seed'),
};

export const catalogApi = {
  search: (params: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    minQuantity?: number;
    unit?: string;
    country?: string;
    page?: number;
    limit?: number;
  }) => api.get('/catalog/search', { params }),
  getMap: () => api.get('/catalog/map'),
  getCategories: () => api.get('/catalog/categories'),
};

export const alertApi = {
  create: (data: { categoryId?: string; region?: string }) => api.post('/alerts', data),
  getAll: () => api.get('/alerts'),
  delete: (id: string) => api.delete(`/alerts/${id}`),
  toggle: (id: string) => api.put(`/alerts/${id}/toggle`),
};

export const kybApi = {
  submit: (docs: any) => api.post('/kyb/submit', { docs }),
  getPending: () => api.get('/kyb/admin/pending'),
  approve: (orgId: string) => api.put(`/kyb/admin/approve/${orgId}`),
  reject: (orgId: string, reason: string) => api.put(`/kyb/admin/reject/${orgId}`, { reason }),
};

export const moderationApi = {
  getPendingListings: () => api.get('/listings/admin/pending'),
  approveListing: (id: string) => api.put(`/listings/admin/approve/${id}`),
  rejectListing: (id: string, reason: string) => api.put(`/listings/admin/reject/${id}`, { reason }),
};

export interface Offer {
  id: string;
  listingId: string;
  buyerOrgId: string;
  quantity: number;
  unitPrice: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  parentOfferId?: string;
  expiresAt?: string;
  createdAt: string;
  listing?: Listing;
  buyer?: { id: string; name: string; country?: string };
  parent?: Offer;
  order?: Order;
}

export interface Order {
  id: string;
  offerId: string;
  sellerOrgId: string;
  buyerOrgId: string;
  status: string;
  totalAmount: number;
  platformFee: number;
  netAmount: number;
  createdAt: string;
}

export interface Contract {
  id: string;
  orderId: string;
  contentHash: string;
  pdfUrl?: string;
  status: string;
  createdAt: string;
}

export const offerApi = {
  create: (data: { listingId: string; quantity: number; unitPrice: number; message?: string }) => api.post<Offer>('/offers', data),
  getForBuyer: () => api.get<Offer[]>('/offers/buyer'),
  getById: (id: string) => api.get<Offer>(`/offers/${id}`),
  getForListing: (listingId: string) => api.get<Offer[]>(`/offers/listing/${listingId}`),
  accept: (id: string) => api.put<{ offer: Offer; order: Order }>(`/offers/${id}/accept`, {}),
  reject: (id: string) => api.put<Offer>(`/offers/${id}/reject`, {}),
  counter: (id: string, data: { quantity?: number; unitPrice?: number; message?: string }) => api.post<Offer>(`/offers/${id}/counter`, data),
};

export const contractApi = {
  create: (orderId: string) => api.post<Contract>('/contracts', { orderId }),
  getById: (id: string) => api.get<Contract>(`/contracts/${id}`),
  sign: (contractId: string) => api.post(`/contracts/${contractId}/sign`, {}),
  confirmDelivery: (orderId: string) => api.post(`/contracts/order/${orderId}/delivery`, {}),
};

export const orderApi = {
  getMyOrders: () => api.get<Order[]>('/orders/my'),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
};

export default api;