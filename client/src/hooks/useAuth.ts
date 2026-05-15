'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, clearAuth, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (token && !isAuthenticated) {
      authService.getMe()
        .then(setUser)
        .catch(() => clearAuth())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user } = await authService.login(email, password);
      setUser(user);
      toast.success("Muvaffaqiyatli kirdingiz!");
      if (user.role === 'ADMIN') router.push('/admin');
      else if (!user.onboardingDone) router.push('/onboarding');
      else router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Kirish muvaffaqiyatsiz");
      throw err;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const { user } = await authService.register(email, password, name);
      setUser(user);
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      router.push('/onboarding');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Ro'yxatdan o'tish muvaffaqiyatsiz");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      toast.success("Muvaffaqiyatli chiqdingiz!");
      router.push('/');
    }
  };

  return { user, isAuthenticated, isLoading, login, register, logout };
}
