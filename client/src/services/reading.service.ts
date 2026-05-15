import { api } from './api';

export interface VocabItem {
  word: string;
  definition: string;
  translation: string;
}

export interface QuestionItem {
  question: string;
  answer: string;
}

export interface ReadingSource {
  title: string;
  author?: string;
  year?: string;
  type: 'original' | 'adapted' | 'ai';
}

export interface ReadingPassage {
  title: string;
  type: string;
  level: string;
  content: string;
  wordCount: number;
  source: ReadingSource;
  vocabulary: VocabItem[];
  questions: QuestionItem[];
}

export const readingService = {
  async generate(topic: string, level?: string): Promise<ReadingPassage> {
    const { data } = await api.post('/reading/generate', { topic, level });
    return data.data;
  },

  async saveWord(word: VocabItem, level: string): Promise<{ saved: boolean; alreadyExisted: boolean }> {
    const { data } = await api.post('/reading/save-word', {
      word: word.word,
      definition: word.definition,
      translation: word.translation,
      level,
    });
    return data.data;
  },
};
