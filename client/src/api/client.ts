import axios from 'axios';
import { toast } from 'sonner';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept every response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
 
      if (localStorage.getItem('token')) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000); // 1-second delay to read the toast
      }
    }
    
    return Promise.reject(error);
  }
);