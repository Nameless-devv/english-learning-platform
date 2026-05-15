'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { t } from '@/lib/i18n';

const schema = z.object({
  email: z.string().email('Email notoʻgʻri'),
  password: z.string().min(1, 'Parol kiritilishi shart'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch {
      // error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-700 font-bold text-2xl mb-2">
            <BookOpen className="w-7 h-7" />
            ELP
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">{t.auth.login}</h1>
          <p className="text-gray-500 text-sm mt-1">Hisobingizga kiring</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.auth.email}</label>
              <input
                {...register('email')}
                type="email"
                placeholder={t.auth.emailPlaceholder}
                className="input-field"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.auth.password}</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder={t.auth.passwordPlaceholder}
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base"
            >
              {loading ? 'Kirish...' : t.auth.login}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t.auth.noAccount}{' '}
            <Link href="/auth/register" className="text-primary-600 font-medium hover:underline">
              {t.auth.register}
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
