import { api } from './api';

export type ExerciseType = 'fill_blank' | 'multiple_choice' | 'error_correction' | 'word_order';

export interface Exercise {
  type: ExerciseType;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface GrammarLesson {
  topic: string;
  level: string;
  tip: string;
  exercises: Exercise[];
}

export const grammarService = {
  async generate(topic: string, level?: string): Promise<GrammarLesson> {
    const { data } = await api.post('/grammar/generate', { topic, level });
    return data.data;
  },
};
