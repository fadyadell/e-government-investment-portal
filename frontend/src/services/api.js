import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.error?.message || error.message;
    console.error('[API Error]', message);
    return Promise.reject(error);
  }
);

export const getRequests = async () => {
  const response = await api.get('/requests');
  return response.data;
};

export const getRequestById = async (id) => {
  const response = await api.get(`/requests/${id}`);
  return response.data;
};

export const getPendingApprovals = async () => {
  const response = await api.get('/requests/pending');
  return response.data;
};

export const createRequest = async (data) => {
  const response = await api.post('/requests', data);
  return response.data;
};

export const approveRequest = async (id, data) => {
  const response = await api.put(`/requests/approve/${id}`, data);
  return response.data;
};

export const rejectRequest = async (id, data) => {
  const response = await api.put(`/requests/reject/${id}`, data);
  return response.data;
};

export const escalateRequest = async (id, data) => {
  const response = await api.put(`/requests/escalate/${id}`, data);
  return response.data;
};

export default api;
