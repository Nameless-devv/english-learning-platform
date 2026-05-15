import { api } from './api';
import { ApiResponse } from '@/types';

export interface WritingBandResult {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  overallBand: number;
  wordCount: number;
  feedback: {
    taskAchievement: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
    overall: string;
    suggestions: string[];
    improvedSentence: string;
  };
}

export interface SpeakingBandResult {
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  overallBand: number;
  transcript: string;
  feedback: {
    fluencyCoherence: string;
    lexicalResource: string;
    grammaticalRange: string;
    pronunciation: string;
    overall: string;
    strongPoints: string[];
    improvements: string[];
    modelAnswer: string;
  };
}

export interface ReadingQuestion {
  id: number;
  type: 'tfng' | 'mcq' | 'completion';
  question: string;
  options?: string[];
  answer: string;
}

export interface IeltsPassage {
  title: string;
  passage: string;
  wordCount: number;
  questions: ReadingQuestion[];
}

export interface IeltsResult {
  id: string;
  type: string;
  band: number;
  scores: Record<string, number>;
  createdAt: string;
}

export interface SpeakingPrompt {
  part: number;
  title: string;
  instructions: string;
  questions?: string[];
  cueCard?: string;
  followUp?: string;
}

export const ieltsService = {
  async generateWritingPrompt(taskType: 'task1' | 'task2') {
    const { data } = await api.post<ApiResponse<{ prompt: string; context: string }>>('/ielts/writing/generate', { taskType });
    return data.data;
  },

  async checkWriting(text: string, taskType: 'task1' | 'task2', prompt: string): Promise<WritingBandResult> {
    const { data } = await api.post<ApiResponse<WritingBandResult>>('/ielts/writing/check', { text, taskType, prompt });
    return data.data;
  },

  async getSpeakingPrompt(part: 1 | 2 | 3, topic?: string): Promise<SpeakingPrompt> {
    const { data } = await api.get<ApiResponse<SpeakingPrompt>>('/ielts/speaking/prompt', { params: { part, topic } });
    return data.data;
  },

  async analyzeSpeaking(audioBlob: Blob, part: number, promptText: string): Promise<SpeakingBandResult> {
    const form = new FormData();
    form.append('audio', audioBlob, 'audio.webm');
    form.append('part', String(part));
    form.append('prompt', promptText);
    const { data } = await api.post<ApiResponse<SpeakingBandResult>>('/ielts/speaking/analyze', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async generatePassage(topic?: string): Promise<IeltsPassage> {
    const { data } = await api.post<ApiResponse<IeltsPassage>>('/ielts/reading/generate', { topic });
    return data.data;
  },

  async scoreReading(correct: number, total: number, title: string) {
    const { data } = await api.post<ApiResponse<{ band: number }>>('/ielts/reading/score', { correct, total, title });
    return data.data;
  },

  async getResults(): Promise<IeltsResult[]> {
    const { data } = await api.get<ApiResponse<IeltsResult[]>>('/ielts/results');
    return data.data;
  },
};
