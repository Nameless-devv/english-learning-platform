'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, BookOpen, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ieltsService, IeltsPassage, ReadingQuestion } from '@/services/ielts.service';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const TOPICS = [
  'Climate change', 'Artificial intelligence', 'Urbanisation',
  'Psychology', 'Space exploration', 'Digital education',
  'Biodiversity', 'Globalisation',
];

function bandColor(b: number) {
  if (b >= 7) return 'text-green-600 bg-green-50 border-green-200';
  if (b >= 5.5) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (b >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-500 bg-red-50 border-red-200';
}

export default function IeltsReadingPage() {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [passage, setPassage] = useState<IeltsPassage | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [band, setBand] = useState<number | null>(null);

  const generate = async (topic?: string) => {
    setLoading(true);
    setPassage(null);
    setAnswers({});
    setSubmitted(false);
    setBand(null);
    try {
      const res = await ieltsService.generatePassage(topic);
      setPassage(res);
    } catch {
      toast.error("Matn yaratishda xato. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!passage) return;
    const unanswered = passage.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(`${unanswered.length} ta savol javobsiz qoldi`);
      return;
    }
    setSubmitted(true);
    const correct = passage.questions.filter((q) => {
      const given = (answers[q.id] ?? '').trim().toLowerCase();
      const expected = q.answer.trim().toLowerCase();
      return given === expected || expected.includes(given) || given.includes(expected.split(' ')[0]);
    }).length;

    try {
      const res = await ieltsService.scoreReading(correct, passage.questions.length, passage.title);
      setBand(res.band);
    } catch {
      const b = [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];
      setBand(b[Math.floor((correct / passage.questions.length) * (b.length - 1))]);
    }
  };

  const correctCount = passage
    ? passage.questions.filter((q) => {
        const given = (answers[q.id] ?? '').trim().toLowerCase();
        const expected = q.answer.trim().toLowerCase();
        return given === expected || expected.includes(given) || given.includes(expected.split(' ')[0]);
      }).length
    : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="page-container max-w-3xl mx-auto">

          <div className="flex items-center gap-3 mb-6">
            <Link href="/ielts" className="text-gray-400 hover:text-gray-600"><ChevronLeft className="w-5 h-5" /></Link>
            <BookOpen className="w-5 h-5 text-green-500" />
            <h1 className="text-xl font-bold text-gray-900">IELTS Reading</h1>
          </div>

          {/* Topic selector */}
          {!passage && !loading && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Mavzu tanlang yoki tasodifiy yarating</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {TOPICS.map((t) => (
                  <button key={t} onClick={() => setSelectedTopic(t === selectedTopic ? '' : t)}
                    className={cn('px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                      selectedTopic === t
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                    )}>
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={() => generate(selectedTopic || undefined)}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base">
                <BookOpen className="w-5 h-5" />
                {selectedTopic ? `"${selectedTopic}" mavzusida matn` : 'Tasodifiy matn yaratish'}
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="card text-center py-16">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Akademik matn yaratilmoqda...</p>
              <p className="text-xs text-gray-400 mt-1">Bu 15-20 soniya olishi mumkin</p>
            </div>
          )}

          {/* Passage + Questions */}
          {passage && (
            <div className="space-y-6">
              {/* Result bar if submitted */}
              {submitted && band !== null && (
                <div className={cn('card flex items-center justify-between border-2', bandColor(band))}>
                  <div>
                    <h2 className="font-bold text-lg">Natija: {correctCount}/{passage.questions.length}</h2>
                    <p className="text-sm opacity-80">Taxminiy band score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold">{band}</p>
                    <p className="text-xs">Band</p>
                  </div>
                </div>
              )}

              {/* Passage text */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">{passage.title}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{passage.wordCount} so'z</p>
                  </div>
                  {!submitted && (
                    <button onClick={() => generate(selectedTopic || undefined)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
                      <RefreshCw className="w-3.5 h-3.5" /> Yangi
                    </button>
                  )}
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                  {passage.passage}
                </div>
              </div>

              {/* Questions */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Savollar ({passage.questions.length} ta)</h3>
                <div className="space-y-6">
                  {passage.questions.map((q) => (
                    <QuestionItem key={q.id} q={q} answer={answers[q.id] ?? ''}
                      submitted={submitted}
                      onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                    />
                  ))}
                </div>

                {!submitted ? (
                  <button onClick={handleSubmit}
                    className="w-full btn-primary mt-6 py-3 text-base flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Tekshirish
                  </button>
                ) : (
                  <button onClick={() => generate(selectedTopic || undefined)}
                    className="w-full btn-secondary mt-6 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Yangi matn
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

function QuestionItem({
  q, answer, submitted, onChange,
}: {
  q: ReadingQuestion; answer: string; submitted: boolean; onChange: (v: string) => void;
}) {
  const isCorrect = submitted && (() => {
    const given = answer.trim().toLowerCase();
    const expected = q.answer.trim().toLowerCase();
    return given === expected || expected.includes(given) || given.includes(expected.split(' ')[0]);
  })();

  const borderCls = submitted
    ? isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
    : 'border-gray-100 bg-white';

  return (
    <div className={cn('rounded-xl border p-4', borderCls)}>
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xs font-bold text-gray-400 shrink-0 mt-0.5">#{q.id}</span>
        <div className="flex-1">
          <span className={cn('text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mr-2',
            q.type === 'tfng' ? 'bg-purple-100 text-purple-700'
              : q.type === 'mcq' ? 'bg-blue-100 text-blue-700'
              : 'bg-orange-100 text-orange-700'
          )}>
            {q.type === 'tfng' ? 'T/F/NG' : q.type === 'mcq' ? 'MCQ' : 'Completion'}
          </span>
          <span className="text-sm font-medium text-gray-800">{q.question}</span>
        </div>
        {submitted && (
          isCorrect
            ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
            : <XCircle className="w-5 h-5 text-red-400 shrink-0" />
        )}
      </div>

      {/* T/F/NG */}
      {q.type === 'tfng' && (
        <div className="flex gap-2">
          {['True', 'False', 'Not Given'].map((opt) => {
            let cls = 'border-gray-200 bg-white text-gray-700';
            if (submitted) {
              if (opt === q.answer) cls = 'border-green-400 bg-green-50 text-green-800 font-semibold';
              else if (opt === answer && opt !== q.answer) cls = 'border-red-300 bg-red-50 text-red-700';
            } else if (opt === answer) cls = 'border-primary-500 bg-primary-50 text-primary-800 font-medium';
            return (
              <button key={opt} disabled={submitted} onClick={() => onChange(opt)}
                className={cn('flex-1 py-2 rounded-xl border text-xs font-medium transition-all', cls)}>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* MCQ */}
      {q.type === 'mcq' && q.options && (
        <div className="space-y-2">
          {q.options.map((opt) => {
            let cls = 'border-gray-200 bg-white text-gray-700';
            if (submitted) {
              if (opt === q.answer) cls = 'border-green-400 bg-green-50 text-green-800 font-semibold';
              else if (opt === answer && opt !== q.answer) cls = 'border-red-300 bg-red-50 text-red-700';
              else cls = 'border-gray-100 bg-gray-50 text-gray-400';
            } else if (opt === answer) cls = 'border-primary-500 bg-primary-50 text-primary-800 font-medium';
            return (
              <button key={opt} disabled={submitted} onClick={() => onChange(opt)}
                className={cn('w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all', cls)}>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Completion */}
      {q.type === 'completion' && (
        <div>
          <input type="text" value={answer} disabled={submitted}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Javobingizni yozing..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 disabled:bg-gray-50"
          />
          {submitted && !isCorrect && (
            <p className="text-xs text-green-700 mt-1.5 font-medium">
              To'g'ri javob: <span className="font-bold">{q.answer}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
