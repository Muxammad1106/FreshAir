import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

// Список публичных endpoints, которые не требуют токена
const PUBLIC_ENDPOINTS = [
  '/api/v1/users/auth/login',
  '/api/v1/users/auth/register',
  '/api/v1/users/sign-in',
  '/api/v1/users/sign-up',
  '/api/v1/users/confirm',
  '/api/v1/users/reset_link',
  '/api/v1/users/reset_password',
];

// Проверка, является ли endpoint публичным
const isPublicEndpoint = (url: string): boolean => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// Request interceptor - автоматически добавляет токен из sessionStorage
// НО НЕ для публичных endpoints (login, register, etc.)
axiosInstance.interceptors.request.use(
  (config) => {
    // Не добавляем токен для публичных endpoints
    if (!isPublicEndpoint(config.url || '')) {
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - обработка ошибок
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

export const API_ENDPOINTS = {
  // Users API
  users: {
    register: '/api/v1/users/auth/register',
    login: '/api/v1/users/auth/login',
    me: '/api/v1/users/me',
    refresh: '/api/v1/users/refresh',
    signOut: '/api/v1/users/sign-out',
    signIn: '/api/v1/users/sign-in',
    signUp: '/api/v1/users/sign-up',
    confirm: '/api/v1/users/confirm',
    userList: '/api/v1/users/user',
    userSettings: '/api/v1/users/user_settings',
    changePassword: '/api/v1/users/change_password',
    resetLink: '/api/v1/users/reset_link',
    resetPassword: '/api/v1/users/reset_password',
  },
  // Core API
  core: {
    configurations: '/api/v1/core/configurations',
    general: '/api/v1/core/general',
    company: '/api/v1/core/company',
    // Customer endpoints
    customer: {
      rooms: '/api/v1/core/customer/rooms',
      orders: '/api/v1/core/customer/orders',
      devices: '/api/v1/core/customer/devices',
      deviceToggle: (id: number) => `/api/v1/core/customer/devices/${id}/toggle`,
      deviceMetrics: (id: number) => `/api/v1/core/customer/devices/${id}/metrics`,
    },
    // Investor endpoints
    investor: {
      dashboard: '/api/v1/core/investor/dashboard',
      devicesAvailable: '/api/v1/core/investor/devices/available',
      investments: '/api/v1/core/investor/investments',
      confirmPayment: (id: number) => `/api/v1/core/investor/investments/${id}/confirm-payment`,
    },
    // Admin endpoints
    admin: {
      devices: '/api/v1/core/admin/devices',
      deviceDetail: (id: number) => `/api/v1/core/admin/devices/${id}`,
      deviceStatus: (id: number) => `/api/v1/core/admin/devices/${id}/status`,
    },
    // Internal endpoints
    internal: {
      deviceMetrics: (id: number) => `/api/v1/core/internal/devices/${id}/metrics`,
    },
  },
  // Toolkit API (Swagger documentation)
  toolkit: {
    openapi: '/api/v1/toolkit/openapi',
    swagger: '/api/v1/toolkit/',
  },
};
