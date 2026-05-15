'use client';

import { useState, useEffect, useCallback } from 'react';
import { learningService } from '@/services/learning.service';
import { useLearningStore } from '@/stores/learning.store';
import toast from 'react-hot-toast';

export function useDailyPlan() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { dailyPlan, setDailyPlan } = useLearningStore();

  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const plan = await learningService.getDailyPlan();
      setDailyPlan(plan);
    } catch {
      setError('Kunlik reja yuklanmadi');
    } finally {
      setLoading(false);
    }
  }, [setDailyPlan]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const completeWord = async (planWordId: string): Promise<{ completed: boolean } | null> => {
    try {
      const result = await learningService.completePlanWord(planWordId);
      if (result?.completed) {
        toast.success('Kunlik reja bajarildi! +50 XP 🎉');
      }
      await fetchPlan();
      return result ?? null;
    } catch {
      toast.error('Xato yuz berdi');
      return null;
    }
  };

  const resetPlan = async () => {
    try {
      setLoading(true);
      const plan = await learningService.resetDailyPlan();
      setDailyPlan(plan);
    } catch {
      toast.error('Reja yangilanmadi');
    } finally {
      setLoading(false);
    }
  };

  return { dailyPlan, loading, error, refetch: fetchPlan, completeWord, resetPlan };
}
