'use client';

import { useEffect } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';

export function useHeartbeat() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const ping = () => api.post('/users/heartbeat').catch(() => {});

    ping(); // immediate on mount
    const id = setInterval(ping, 60_000); // every 60s
    return () => clearInterval(id);
  }, [user?.id]);
}
