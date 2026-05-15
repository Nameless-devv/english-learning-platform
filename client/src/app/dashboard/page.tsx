'use client';

import { useEffect, useState } from 'react';
import { Flame, Star, BookOpen, PenLine, TrendingUp, Calendar } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DailyPlanWidget } from '@/components/dashboard/DailyPlanWidget';
import { useDailyPlan } from '@/hooks/useDailyPlan';
import { learningService } from '@/services/learning.service';
import { useAuthStore } from '@/stores/auth.store';
import { t } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { dailyPlan, loading } = useDailyPlan();
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    learningService.getProgress().then(setProgress).catch(() => {});
  }, []);

  const stats = [
    {
      label: t.dashboard.streak,
      value: `${user?.streak || 0} ${t.dashboard.days}`,
      icon: Flame,
      color: 'text-orange-500 bg-orange-50',
    },
    {
      label: t.dashboard.xp,
      value: `${user?.xp || 0} XP`,
      icon: Star,
      color: 'text-yellow-500 bg-yellow-50',
    },
    {
      label: t.vocabulary.learned,
      value: progress?.learnedWords || 0,
      icon: BookOpen,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      label: 'Yozuvlar',
      value: progress?.totalWritings || 0,
      icon: PenLine,
      color: 'text-purple-500 bg-purple-50',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="page-container">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {t.dashboard.welcome}, {user?.name || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(new Date())}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <DailyPlanWidget plan={dailyPlan} loading={loading} />

            {/* Recent Activity */}
            <div className="card">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Haftalik aktivlik</h3>
              </div>
              <div className="flex items-end gap-2 h-32">
                {progress?.recentActivity?.length > 0 ? progress.recentActivity.map((day: any) => {
                  const dateObj = day.date ? new Date(day.date) : null;
                  const label = dateObj && !isNaN(dateObj.getTime())
                    ? dateObj.toLocaleDateString('uz', { weekday: 'short' })
                    : '—';
                  return (
                    <div key={day.date ?? label} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t-lg transition-all ${day.completed ? 'bg-primary-500' : 'bg-gray-100'}`}
                        style={{ height: day.completed ? '100%' : '20%' }}
                      />
                      <span className="text-xs text-gray-400">{label}</span>
                    </div>
                  );
                }) : (
                  <div className="w-full flex items-center justify-center text-sm text-gray-400">
                    Maʼlumot yoʻq
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
