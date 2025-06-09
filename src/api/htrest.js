// src/api/htrest.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_HTREST_API_BASE_URL || '/api/v1';

export const htrestApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // Timeout auf 20 Sekunden erhöht
  headers: {
    'Content-Type': 'application/json',
  },
});

htrestApi.interceptors.request.use(config => {
  const token = localStorage.getItem('htrest_auth_token');
  if (token) {
    config.headers.Authorization = `Basic ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

htrestApi.interceptors.response.use(response => response, error => {
  if (error.response) {
    console.error('API Error:', error.response.data);
    console.error('Status:', error.response.status);
    if (error.response.status === 401) {
      import('@/stores/auth').then(({ useAuthStore }) => {
        const authStore = useAuthStore();
        authStore.logout();
      });
    }
  } else if (error.request) {
    console.error('No response received:', error.request);
  } else {
    console.error('Error setting up request:', error.message);
  }
  return Promise.reject(error);
});

// Parameter API functions
export const getParameters = () => htrestApi.get('/param/');
export const setParameter = (paramId, value) => htrestApi.put(`/param/${paramId}`, { value });
export const getParameter = (paramId) => htrestApi.get(`/param/${paramId}`);
export const getFastQueryValues = () => htrestApi.get('/fastquery'); // Behalten, falls noch benötigt, aber Dashboard nutzt /param
export const getFaultList = () => htrestApi.get('/faultlist/');

// Time Program API functions
export const getTimePrograms = () => htrestApi.get('/timeprog/');
export const getTimeProgram = (id) => htrestApi.get(`/timeprog/${id}`);
export const updateTimeProgram = (id, data) => htrestApi.put(`/timeprog/${id}`, data);
export const setTimeProgramEntry = (id, day, num, data) => htrestApi.put(`/timeprog/${id}/${day}/${num}`, data);