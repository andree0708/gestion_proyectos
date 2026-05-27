import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterData } from '../types/auth';
import { Listing, CreateListingDto, Category } from '../types/listing';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
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
    console.log('API Error:', error.message, error.code);
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      throw new Error('Tiempo de espera agotado');
    }
    if (!error.response) {
      console.error('No response - network error');
      throw new Error('Error de conexión');
    }
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
  search: (params: any) => api.get('/catalog/search', { params }),
  getMap: () => api.get('/catalog/map'),
  getCategories: () => api.get('/catalog/categories'),
};

export const offerApi = {
  create: (data: any) => api.post('/offers', data),
  getForSeller: () => api.get('/offers/seller'),
  getForBuyer: () => api.get('/offers/buyer'),
  getById: (id: string) => api.get(`/offers/${id}`),
  getForListing: (listingId: string) => api.get(`/offers/listing/${listingId}`),
  accept: (id: string) => api.put(`/offers/${id}/accept`, {}),
  reject: (id: string) => api.put(`/offers/${id}/reject`, {}),
  counter: (id: string, data: any) => api.post(`/offers/${id}/counter`, data),
};

export const orderApi = {
  getMyOrders: () => api.get('/orders/my'),
  getById: (id: string) => api.get(`/orders/${id}`),
};

export const shipmentApi = {
  getMy: () => api.get('/shipments/my'),
  getByOrder: (orderId: string) => api.get(`/shipments/orders/${orderId}`),
  trackByCode: (trackingCode: string) => api.get(`/shipments/tracking/${trackingCode}`),
  create: (orderId: string, data: any) => api.post(`/shipments/orders/${orderId}`, data),
  update: (id: string, data: any) => api.put(`/shipments/${id}`, data),
  updateStatus: (id: string, status: string, location?: string) => api.put(`/shipments/${id}/status`, { status, location }),
  calculate: (data: { weightKg: number; volumeM3: number; distanceKm?: number }) =>
    api.post('/shipments/calculate', data),
};

export const paymentApi = {
  getMy: () => api.get('/payments/my'),
  create: (orderId: string) => api.post(`/payments/orders/${orderId}`),
  processPayment: (id: string, paymentMethodId: string) => api.post(`/payments/${id}/process`, { paymentMethodId }),
  getInvoice: (paymentId: string) => api.get(`/payments/invoices/${paymentId}`),
  getInvoicePdf: (paymentId: string) => `/api/payments/invoices/${paymentId}/pdf`,
  saveBankAccount: (data: any) => api.post('/payments/bank', data),
  getBankAccount: () => api.get('/payments/bank'),
};

export const reviewApi = {
  create: (orderId: string, data: { rating: number; comment?: string }) =>
    api.post(`/reviews/orders/${orderId}`, data),
  getForOrg: (orgId?: string) => api.get(`/reviews/org/${orgId || ''}`),
};

export const messageApi = {
  getMy: () => api.get('/messages/my'),
  getByOrder: (orderId: string) => api.get(`/messages/order/${orderId}`),
  send: (conversationId: string, content: string) =>
    api.post(`/messages/${conversationId}/messages`, { content }),
};

export const analyticsApi = {
  getStats: () => api.get('/analytics/stats'),
  exportCsv: () => api.get('/analytics/export/csv', { responseType: 'blob' }),
  exportPdf: () => api.get('/analytics/export/pdf', { responseType: 'blob' }),
};

export const contractApi = {
  sign: (contractId: string) => api.post(`/contracts/${contractId}/sign`, {}),
  confirmDelivery: (orderId: string) => api.post(`/contracts/order/${orderId}/delivery`, {}),
};

export const disputeApi = {
  getMy: () => api.get('/disputes/my'),
  getAll: (status?: string) => api.get('/disputes/admin', { params: status ? { status } : {} }),
  getById: (id: string) => api.get(`/disputes/${id}`),
  create: (orderId: string, data: any) => api.post(`/disputes/orders/${orderId}`, data),
  addEvidence: (id: string, data: any) => api.post(`/disputes/${id}/evidence`, data),
  resolve: (id: string, resolution: string) => api.post(`/disputes/${id}/resolve`, { resolution }),
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

export default api;