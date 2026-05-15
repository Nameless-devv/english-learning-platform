'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, PenLine, RefreshCw, Send, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ieltsService, WritingBandResult } from '@/services/ielts.service';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type TaskType = 'task1' | 'task2';

function BandRing({ score }: { score: number }) {
  const r = 42, circ = 2 * Math.PI * r;
  const pct = (score / 9) * 100;
  const color = score >= 7 ? '#22c55e' : score >= 5.5 ? '#3b82f6' : score >= 4 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-28 h-28">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{score}</span>
        <span className="text-xs text-gray-400">Band</span>
      </div>
    </div>
  );
}

function CriterionBar({ label, score, description }: { label: string; score: number; description: string }) {
  const [open, setOpen] = useState(false);
  const pct = (score / 9) * 100;
  const color = score >= 7 ? 'bg-green-500' : score >= 5.5 ? 'bg-blue-500' : score >= 4 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="border border-gray-100 rounded-xl p-3">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-medium text-gray-600 flex-1">{label}</span>
        <span className="text-sm font-bold text-gray-900 w-8 text-right">{score}</span>
        <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-gray-600">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      {open && <p className="text-xs text-gray-600 mt-2 leading-relaxed">{description}</p>}
    </div>
  );
}

export default function IeltsWritingPage() {
  const [task, setTask] = useState<TaskType>('task2');
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<WritingBandResult | null>(null);
  const [showImproved, setShowImproved] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minWords = task === 'task1' ? 150 : 250;

  const generatePrompt = async () => {
    setGenerating(true);
    setResult(null);
    setText('');
    try {
      const res = await ieltsService.generateWritingPrompt(task);
      setPrompt(res.prompt);
      setContext(res.context ?? '');
    } catch {
      toast.error('Prompt yaratishda xato');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { generatePrompt(); }, [task]);

  const handleCheck = async () => {
    if (wordCount < 50) { toast.error("Kamida 50 ta so'z yozing"); return; }
    setChecking(true);
    try {
      const res = await ieltsService.checkWriting(text, task, prompt);
      setResult(res);
    } catch {
      toast.error('Baholashda xato');
    } finally {
      setChecking(false);
    }
  };

  const criteriaLabels: Record<string, string> = {
    taskAchievement: task === 'task1' ? 'Task Achievement' : 'Task Response',
    coherenceCohesion: 'Coherence & Cohesion',
    lexicalResource: 'Lexical Resource',
    grammaticalRange: 'Grammatical Range & Accuracy',
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="page-container max-w-3xl mx-auto">

          <div className="flex items-center gap-3 mb-6">
            <Link href="/ielts" className="text-gray-400 hover:text-gray-600"><ChevronLeft className="w-5 h-5" /></Link>
            <PenLine className="w-5 h-5 text-blue-500" />
            <h1 className="text-xl font-bold text-gray-900">IELTS Writing</h1>
          </div>

          {/* Task tabs */}
          <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-100 w-fit">
            {(['task1', 'task2'] as TaskType[]).map((t) => (
              <button key={t} onClick={() => setTask(t)}
                className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-colors',
                  task === t ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                )}>
                {t === 'task1' ? 'Task 1 — Grafik' : 'Task 2 — Esse'}
              </button>
            ))}
          </div>

          {/* Prompt card */}
          <div className="card mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {task === 'task1' ? 'Task 1 • Kamida 150 so\'z' : 'Task 2 • Kamida 250 so\'z'}
                </span>
              </div>
              <button onClick={generatePrompt} disabled={generating}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-40">
                <RefreshCw className={cn('w-3.5 h-3.5', generating && 'animate-spin')} />
                Yangi savol
              </button>
            </div>
            {generating ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${85 - i * 15}%` }} />
                ))}
              </div>
            ) : (
              <>
                <p className="text-gray-800 leading-relaxed">{prompt}</p>
                {context && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">{context}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Text area */}
          {!result && (
            <div className="card mb-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Javobingizni shu yerga yozing..."
                rows={12}
                className="w-full resize-none text-sm text-gray-800 focus:outline-none leading-relaxed"
              />
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className={cn('text-xs font-medium',
                  wordCount >= minWords ? 'text-green-600' : wordCount > 0 ? 'text-orange-500' : 'text-gray-400'
                )}>
                  {wordCount} so'z {wordCount < minWords && wordCount > 0 ? `(${minWords - wordCount} ta kam)` : wordCount >= minWords ? '✓' : ''}
                </span>
                <button onClick={handleCheck} disabled={checking || wordCount < 10}
                  className="btn-primary flex items-center gap-2 disabled:opacity-40">
                  {checking ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Baholanmoqda...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Baholash</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Band score */}
              <div className="card flex flex-col sm:flex-row items-center gap-6">
                <BandRing score={result.overallBand} />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    Umumiy ball: Band {result.overallBand}
                  </h2>
                  <p className="text-sm text-gray-600 mb-3">{result.feedback.overall}</p>
                  <p className="text-xs text-gray-400">{result.wordCount} so'z yozildi</p>
                </div>
              </div>

              {/* Criteria */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Mezonlar bo'yicha baho</h3>
                <div className="space-y-2">
                  {(['taskAchievement', 'coherenceCohesion', 'lexicalResource', 'grammaticalRange'] as const).map((key) => (
                    <CriterionBar key={key}
                      label={criteriaLabels[key]}
                      score={result[key]}
                      description={result.feedback[key]}
                    />
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              {result.feedback.suggestions?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" /> Maslahatlar
                  </h3>
                  <ul className="space-y-2">
                    {result.feedback.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-primary-500 font-bold shrink-0">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improved sentence */}
              {result.feedback.improvedSentence && (
                <div className="card">
                  <button onClick={() => setShowImproved(!showImproved)}
                    className="flex items-center justify-between w-full text-left">
                    <h3 className="font-semibold text-gray-900">Band 8 namuna jumla</h3>
                    {showImproved ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {showImproved && (
                    <p className="mt-3 text-sm text-gray-700 bg-green-50 border border-green-100 rounded-xl p-3 leading-relaxed italic">
                      "{result.feedback.improvedSentence}"
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setResult(null); setText(''); }}
                  className="flex-1 btn-secondary">
                  Qayta yozish
                </button>
                <button onClick={generatePrompt}
                  className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Yangi savol
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
