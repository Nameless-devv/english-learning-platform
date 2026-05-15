import Cookies from 'js-cookie';
import { api } from './api';
import { User } from '@/types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

function setTokens(accessToken: string, refreshToken: string) {
  Cookies.set('accessToken', accessToken, { expires: 1 / 96, secure: isSecure, sameSite: 'strict' });
  Cookies.set('refreshToken', refreshToken, { expires: 7, secure: isSecure, sameSite: 'strict' });
}

function clearTokens() {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
}

export const authService = {
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/register', { email, password, name });
    setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/login', { email, password });
    setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data;
  },

  async logout(): Promise<void> {
    const refreshToken = Cookies.get('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      clearTokens();
    }
  },

  async getMe(): Promise<User> {
    const { data } = await api.post<{ data: User }>('/auth/me');
    return data.data;
  },

  async updateProfile(payload: { dailyGoal?: number; englishLevel?: string; onboardingDone?: boolean; name?: string }): Promise<Partial<User>> {
    const { data } = await api.put<{ data: Partial<User> }>('/users/profile', payload);
    return data.data;
  },
};
