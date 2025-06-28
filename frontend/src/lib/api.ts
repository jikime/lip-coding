import axios from 'axios';
import Cookies from 'js-cookie';
import { User, SignupData, AuthCredentials, ProfileUpdateData, Mentor, MatchRequest } from '@/types';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
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
    await api.post('/signup', data);
  },

  async login(credentials: AuthCredentials): Promise<string> {
    const response = await api.post('/login', credentials);
    return response.data.token;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/me');
    return response.data;
  },
};

export const profileAPI = {
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    console.log('API client: sending profile update request');
    try {
      const response = await api.put('/profile', data);
      console.log('API client: profile update successful');
      return response.data;
    } catch (error: any) {
      console.error('API client: profile update error', error.response?.data || error.message);
      throw error;
    }
  },

  async getProfileImage(role: string, id: number): Promise<string> {
    const response = await axios.get(`http://localhost:8080/api/images/${role}/${id}`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },
};

export const mentorAPI = {
  async getMentors(filters?: { skill?: string; order_by?: string }): Promise<Mentor[]> {
    const response = await api.get('/mentors', { params: filters });
    return response.data;
  },
};

export const matchRequestAPI = {
  async createRequest(data: { mentorId: number; menteeId: number; message: string }): Promise<MatchRequest> {
    const response = await api.post('/match-requests', data);
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

  async updateRequestStatus(id: number, status: string): Promise<MatchRequest> {
    if (status === 'accepted') {
      return this.acceptRequest(id);
    } else if (status === 'rejected') {
      return this.rejectRequest(id);
    } else {
      throw new Error('Invalid status');
    }
  },

  async getReceivedRequests(userId: number): Promise<MatchRequest[]> {
    const response = await api.get(`/match-requests/received/${userId}`);
    return response.data;
  },

  async getSentRequests(userId: number): Promise<MatchRequest[]> {
    const response = await api.get(`/match-requests/sent/${userId}`);
    return response.data;
  },
};