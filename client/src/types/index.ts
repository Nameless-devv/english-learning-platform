export type Role = 'USER' | 'ADMIN';
export type WordLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  streak: number;
  xp: number;
  dailyGoal: number;
  englishLevel: string;
  onboardingDone: boolean;
  lastActiveAt?: string;
  createdAt: string;
}

export interface Word {
  id: string;
  word: string;
  translation: string;
  example?: string;
  exampleUz?: string;
  level: WordLevel;
  category?: string;
  audioUrl?: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  wordId: string;
  interval: number;
  correctCount: number;
  nextReviewDate: string;
}

export interface DailyPlan {
  id: string;
  date: string;
  completed: boolean;
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
  newWords: (Word & { planWordId: string })[];
  reviewWords: (Word & { planWordId: string })[];
}

export interface WritingFeedback {
  id: string;
  correctedText: string;
  score: number;
  detectedLevel: string;
  mistakes: Array<{
    original: string;
    correction: string;
    explanation: string;
  }>;
  overallFeedback: string;
  levelUpExamples: Array<{
    original: string;
    improved: string;
    targetLevel: string;
    tip: string;
  }>;
  suggestions: string[];
}

export interface Writing {
  id: string;
  text: string;
  feedback: WritingFeedback;
  score: number;
  createdAt: string;
}

export interface VocabularyStats {
  total: number;
  learned: number;
  dueToday: number;
  streak: number;
  xp: number;
}

export interface AdminStats {
  totalUsers: number;
  totalWords: number;
  totalWritings: number;
  activeToday: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
