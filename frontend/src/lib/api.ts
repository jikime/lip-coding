import axios from 'axios';
import Cookies from 'js-cookie';
import { User, SignupData, AuthCredentials, ProfileUpdateData, Mentor, MatchRequest } from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  async signup(data: SignupData): Promise<void> {
    await api.post('/auth/signup', data);
  },

  async login(credentials: AuthCredentials): Promise<string> {
    const response = await api.post('/auth/login', credentials);
    return response.data.token;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const profileAPI = {
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    const response = await api.put('/profile/update', data);
    return response.data;
  },

  async getProfileImage(role: string, id: number): Promise<string> {
    const response = await axios.get(`/api/images/${role}/${id}`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },
};

export const mentorAPI = {
  async getMentors(filters?: { skill?: string; order_by?: string }): Promise<Mentor[]> {
    const response = await api.get('/mentors/list', { params: filters });
    return response.data;
  },
};

export const matchRequestAPI = {
  async createRequest(data: { mentorId: number; menteeId: number; message: string }): Promise<MatchRequest> {
    const response = await api.post('/match-requests/create', data);
    return response.data;
  },

  async getIncomingRequests(): Promise<MatchRequest[]> {
    const response = await api.get('/match-requests/incoming');
    return response.data;
  },

  async getOutgoingRequests(): Promise<MatchRequest[]> {
    const response = await api.get('/match-requests/outgoing');
    return response.data;
  },

  async acceptRequest(id: number): Promise<MatchRequest> {
    const response = await api.put(`/match-requests/${id}/accept`);
    return response.data;
  },

  async rejectRequest(id: number): Promise<MatchRequest> {
    const response = await api.put(`/match-requests/${id}/reject`);
    return response.data;
  },

  async deleteRequest(id: number): Promise<MatchRequest> {
    const response = await api.delete(`/match-requests/${id}/cancel`);
    return response.data;
  },
};