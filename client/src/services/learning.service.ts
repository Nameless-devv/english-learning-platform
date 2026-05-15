import { api } from './api';
import { DailyPlan, Word, VocabularyStats, WritingFeedback, Writing, ApiResponse } from '@/types';

export const learningService = {
  async getDailyPlan(): Promise<DailyPlan> {
    const { data } = await api.get<ApiResponse<DailyPlan>>('/learning/daily-plan');
    return data.data;
  },

  async completePlanWord(planWordId: string): Promise<{ completed: boolean }> {
    const { data } = await api.post<ApiResponse<{ completed: boolean }>>(`/learning/daily-plan/complete/${planWordId}`);
    return data.data;
  },

  async resetDailyPlan(): Promise<DailyPlan> {
    const { data } = await api.post<ApiResponse<DailyPlan>>('/learning/daily-plan/reset');
    return data.data;
  },

  async getProgress() {
    const { data } = await api.get('/learning/progress');
    return data.data;
  },

  async getDailyWords(): Promise<{ newWords: Word[]; reviewWords: Word[] }> {
    const { data } = await api.get<ApiResponse<{ newWords: Word[]; reviewWords: Word[] }>>('/words/daily');
    return data.data;
  },

  async reviewWord(wordId: string, correct: boolean) {
    const { data } = await api.post<ApiResponse<any>>('/words/review', { wordId, correct });
    return data.data;
  },

  async getAllWords(params?: { level?: string; search?: string }): Promise<Word[]> {
    const { data } = await api.get<ApiResponse<Word[]>>('/words', { params });
    return data.data;
  },

  async getMyWords(params?: { category?: string; level?: string }): Promise<Word[]> {
    const { data } = await api.get<ApiResponse<Word[]>>('/words/my', { params });
    return data.data;
  },

  async getVocabularyStats(): Promise<VocabularyStats> {
    const { data } = await api.get<ApiResponse<VocabularyStats>>('/words/stats');
    return data.data;
  },

  async checkWriting(text: string): Promise<WritingFeedback> {
    const { data } = await api.post<ApiResponse<WritingFeedback>>('/writing/check', { text });
    return data.data;
  },

  async getWritingHistory(): Promise<Writing[]> {
    const { data } = await api.get<ApiResponse<Writing[]>>('/writing');
    return data.data;
  },
};
