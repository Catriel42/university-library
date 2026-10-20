import axios from 'axios';

export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
