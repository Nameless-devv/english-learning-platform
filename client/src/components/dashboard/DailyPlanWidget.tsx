'use client';

import Link from 'next/link';
import { BookOpen, PenLine, CheckCircle, Circle } from 'lucide-react';
import { DailyPlan } from '@/types';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface Props {
  plan: DailyPlan | null;
  loading?: boolean;
}

export function DailyPlanWidget({ plan, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const tasks = [
    {
      label: t.dashboard.newWords,
      count: plan?.newWords.length || 0,
      total: 10,
      icon: BookOpen,
      href: '/vocabulary',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: t.dashboard.reviewWords,
      count: plan?.reviewWords.length || 0,
      total: 10,
      icon: BookOpen,
      href: '/vocabulary',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: t.dashboard.writingTask,
      count: 0,
      total: 1,
      icon: PenLine,
      href: '/writing',
      color: 'text-green-600 bg-green-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900">{t.dashboard.todayPlan}</h3>
        {plan && (
          <div className="text-sm text-gray-500">
            {plan.progress.completed}/{plan.progress.total}
          </div>
        )}
      </div>

      {plan && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{t.dashboard.dailyProgress}</span>
            <span>{plan.progress.percentage}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${plan.progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tasks.map(({ label, count, total, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div className={cn('p-2 rounded-lg', color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{count} ta</p>
            </div>
            {count === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 group-hover:text-primary-400 transition-colors" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
