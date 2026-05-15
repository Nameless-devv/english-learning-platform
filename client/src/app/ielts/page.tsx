'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PenLine, Mic, BookOpen, TrendingUp, ChevronRight, Award } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ieltsService, IeltsResult } from '@/services/ielts.service';
import { cn } from '@/lib/utils';

const BAND_LABELS: Record<number, string> = {
  9: 'Expert', 8: 'Very Good', 7: 'Good', 6: 'Competent',
  5: 'Modest', 4: 'Limited', 3: 'Extremely Limited',
};

function bandLabel(score: number) {
  const floor = Math.floor(score);
  return BAND_LABELS[floor] ?? BAND_LABELS[floor - 1] ?? '';
}

function bandColor(score: number) {
  if (score >= 7.5) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 6.0) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 5.0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-500 bg-red-50 border-red-200';
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    writing_task1: 'Writing Task 1', writing_task2: 'Writing Task 2',
    speaking_part1: 'Speaking Part 1', speaking_part2: 'Speaking Part 2',
    speaking_part3: 'Speaking Part 3', reading: 'Reading',
  };
  return map[type] ?? type;
}

function typeIcon(type: string) {
  if (type.startsWith('writing')) return '✍️';
  if (type.startsWith('speaking')) return '🎤';
  if (type === 'reading') return '📖';
  return '📊';
}

export default function IeltsPage() {
  const [results, setResults] = useState<IeltsResult[]>([]);

  useEffect(() => {
    ieltsService.getResults().then(setResults).catch(() => {});
  }, []);

  const avgBand = results.length
    ? Math.round((results.reduce((s, r) => s + r.band, 0) / results.length) * 2) / 2
    : null;

  const sections = [
    {
      href: '/ielts/writing',
      icon: PenLine,
      color: 'bg-blue-500',
      bg: 'from-blue-50 to-white border-blue-100',
      title: 'Writing',
      desc: 'Task 1 (grafik tasviri) va Task 2 (esse) — AI band score 1-9',
      badges: ['Task 1', 'Task 2'],
    },
    {
      href: '/ielts/speaking',
      icon: Mic,
      color: 'bg-orange-500',
      bg: 'from-orange-50 to-white border-orange-100',
      title: 'Speaking',
      desc: 'Part 1/2/3 format — ovozingizni yozib AI dan band score oling',
      badges: ['Part 1', 'Part 2', 'Part 3'],
    },
    {
      href: '/ielts/reading',
      icon: BookOpen,
      color: 'bg-green-500',
      bg: 'from-green-50 to-white border-green-100',
      title: 'Reading',
      desc: 'Akademik matn + T/F/NG, MCQ, sentence completion savollari',
      badges: ['T/F/NG', 'MCQ', 'Completion'],
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="page-container max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">IELTS Tayyorgarlik</h1>
                <p className="text-gray-500 text-sm">Academic band 1–9 • AI baholash</p>
              </div>
              {avgBand && (
                <div className={cn('ml-auto px-4 py-2 rounded-xl border text-center', bandColor(avgBand))}>
                  <p className="text-2xl font-bold leading-none">{avgBand}</p>
                  <p className="text-xs mt-0.5">{bandLabel(avgBand)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Band scale reference */}
          <div className="card mb-6 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Band Score Shkalasi</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[9, 8, 7, 6, 5, 4].map((b) => (
                <div key={b} className={cn('text-center py-2 px-1 rounded-lg border text-xs', bandColor(b))}>
                  <p className="font-bold text-base">{b}</p>
                  <p className="leading-tight">{BAND_LABELS[b]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section cards */}
          <div className="space-y-4 mb-8">
            {sections.map((s) => (
              <Link key={s.href} href={s.href} className={cn(
                'card flex items-center gap-4 hover:shadow-md transition-all bg-gradient-to-r border',
                s.bg,
              )}>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', s.color)}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 text-lg">{s.title}</h2>
                  <p className="text-sm text-gray-500 mb-2">{s.desc}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {s.badges.map((b) => (
                      <span key={b} className="text-xs bg-white/80 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
              </Link>
            ))}
          </div>

          {/* Recent results */}
          {results.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                <h3 className="font-semibold text-gray-900">So'nggi natijalar</h3>
              </div>
              <div className="space-y-2">
                {results.slice(0, 8).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{typeIcon(r.type)}</span>
                      <span className="text-sm text-gray-700 font-medium">{typeLabel(r.type)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString('uz-UZ')}
                      </span>
                      <span className={cn(
                        'text-sm font-bold px-2.5 py-0.5 rounded-lg border',
                        bandColor(r.band),
                      )}>
                        {r.band}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </ProtectedRoute>
  );
}
