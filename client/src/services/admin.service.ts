import { api } from './api';
import { AdminStats, Word, ApiResponse } from '@/types';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const { data } = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return data.data;
  },

  async getUsers(page = 1, limit = 20) {
    const { data } = await api.get('/admin/users', { params: { page, limit } });
    return data.data;
  },

  async getUserDetails(userId: string) {
    const { data } = await api.get(`/admin/users/${userId}`);
    return data.data;
  },

  async createAdmin(email: string, password: string, name?: string) {
    const { data } = await api.post('/admin/users/create-admin', { email, password, name });
    return data.data;
  },

  async changeUserRole(userId: string, role: 'USER' | 'ADMIN') {
    const { data } = await api.put(`/admin/users/${userId}/role`, { role });
    return data.data;
  },

  async deleteUser(userId: string) {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data.data;
  },

  async resetPassword(userId: string, newPassword: string) {
    const { data } = await api.put(`/admin/users/${userId}/reset-password`, { newPassword });
    return data.data;
  },

  async createWord(wordData: Partial<Word>): Promise<Word> {
    const { data } = await api.post<ApiResponse<Word>>('/admin/words', wordData);
    return data.data;
  },

  async generateWords(topic: string, count: number): Promise<{ added: number; skipped: number; words: Word[] }> {
    const { data } = await api.post('/admin/words/generate', { topic, count });
    return data.data;
  },

  async updateWord(id: string, wordData: Partial<Word>): Promise<Word> {
    const { data } = await api.put<ApiResponse<Word>>(`/admin/words/${id}`, wordData);
    return data.data;
  },

  async deleteWord(id: string): Promise<void> {
    await api.delete(`/admin/words/${id}`);
  },
};
