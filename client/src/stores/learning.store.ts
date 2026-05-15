import { create } from 'zustand';
import { DailyPlan, Word, VocabularyStats } from '@/types';

interface LearningState {
  dailyPlan: DailyPlan | null;
  currentFlashcard: (Word & { planWordId: string }) | null;
  flashcardIndex: number;
  isFlipped: boolean;
  stats: VocabularyStats | null;
  setDailyPlan: (plan: DailyPlan) => void;
  setFlashcard: (word: Word & { planWordId: string }, index: number) => void;
  flipCard: () => void;
  nextCard: () => void;
  setStats: (stats: VocabularyStats) => void;
  reset: () => void;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  dailyPlan: null,
  currentFlashcard: null,
  flashcardIndex: 0,
  isFlipped: false,
  stats: null,

  setDailyPlan: (plan) => {
    const allWords = [...plan.newWords, ...plan.reviewWords];
    set({
      dailyPlan: plan,
      currentFlashcard: allWords[0] || null,
      flashcardIndex: 0,
      isFlipped: false,
    });
  },

  setFlashcard: (word, index) => set({ currentFlashcard: word, flashcardIndex: index, isFlipped: false }),

  flipCard: () => set((state) => ({ isFlipped: !state.isFlipped })),

  nextCard: () => {
    const { dailyPlan, flashcardIndex } = get();
    if (!dailyPlan) return;
    const allWords = [...dailyPlan.newWords, ...dailyPlan.reviewWords];
    const nextIndex = flashcardIndex + 1;
    if (nextIndex < allWords.length) {
      set({ currentFlashcard: allWords[nextIndex], flashcardIndex: nextIndex, isFlipped: false });
    }
  },

  setStats: (stats) => set({ stats }),
  reset: () => set({ dailyPlan: null, currentFlashcard: null, flashcardIndex: 0, isFlipped: false }),
}));
