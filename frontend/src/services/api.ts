import axios from 'axios';

// Set the base URL to our FastAPI backend
//const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: 'https://backend-50044174693.development.catalystappsail.in/api/v1'
});
//axios.create({
//  baseURL: baseURL,
//  headers: {
//    'Content-Type': 'application/json',
//  },
//});

// Request Interceptor: Automatically attach the JWT token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the token expires or is invalid, clear it and force re-login
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);