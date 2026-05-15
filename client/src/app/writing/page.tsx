'use client';

import { useState, useEffect } from 'react';
import { PenLine, History, Send, Lightbulb } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { WritingFeedbackCard } from '@/components/writing/WritingFeedbackCard';
import { learningService } from '@/services/learning.service';
import { WritingFeedback, Writing } from '@/types';
import { t } from '@/lib/i18n';
import { formatDate, getScoreColor, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const WRITING_PROMPTS = [
  "Describe your daily routine in English.",
  "Write about your favorite hobby and why you enjoy it.",
  "What did you do last weekend? Describe in detail.",
  "Write about a place you would like to visit and why.",
  "Describe your best friend using adjectives you know.",
];

export default function WritingPage() {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Writing[]>([]);
  const [tab, setTab] = useState<'write' | 'history'>('write');
  const [prompt] = useState(() => WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)]);

  useEffect(() => {
    learningService.getWritingHistory().then(setHistory).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (text.trim().length < 10) {
      toast.error('Kamida 10 ta belgi kiriting');
      return;
    }
    setLoading(true);
    try {
      const result = await learningService.checkWriting(text);
      setFeedback(result);
      learningService.getWritingHistory().then(setHistory);
      toast.success(`Ball: ${result.score}/100`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setText('');
    setFeedback(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="page-container max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t.writing.title}</h1>
          </div>

          <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-100 w-fit">
            <button
              onClick={() => setTab('write')}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === 'write' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50')}
            >
              <PenLine className="w-4 h-4" />
              Yozish
            </button>
            <button
              onClick={() => setTab('history')}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === 'history' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50')}
            >
              <History className="w-4 h-4" />
              Tarix
              {history.length > 0 && (
                <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {tab === 'write' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                {/* Prompt */}
                <div className="card bg-primary-50 border-primary-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">Bugungi mavzu:</span>
                  </div>
                  <p className="text-sm text-primary-800 italic">"{prompt}"</p>
                </div>

                <div className="card">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t.writing.placeholder}
                    className="w-full min-h-48 text-sm text-gray-700 resize-none focus:outline-none leading-relaxed"
                    disabled={loading}
                  />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className={cn('text-xs', text.length > 1800 ? 'text-red-500' : 'text-gray-400')}>
                      {text.length}/2000
                    </span>
                    <div className="flex gap-2">
                      {feedback && (
                        <button onClick={resetForm} className="btn-secondary text-sm py-2">
                          Yangi yozish
                        </button>
                      )}
                      <button
                        onClick={handleSubmit}
                        disabled={loading || text.trim().length < 10}
                        className="btn-primary flex items-center gap-2 text-sm py-2"
                      >
                        <Send className="w-4 h-4" />
                        {loading ? t.writing.checking : t.writing.check}
                      </button>
                    </div>
                  </div>
                </div>

                {feedback && <WritingFeedbackCard feedback={feedback} />}
              </div>

              {/* Tips */}
              <div className="space-y-4">
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    {t.writing.tips}
                  </h3>
                  <ul className="space-y-2">
                    {t.writing.tipsList.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-primary-500 font-bold text-xs mt-0.5">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-16 card">
                  <PenLine className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t.writing.noHistory}</p>
                </div>
              ) : (
                history.map((w) => (
                  <div key={w.id} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">{formatDate(w.createdAt)}</span>
                      <span className={cn('font-bold text-lg', getScoreColor(w.score))}>
                        {w.score}/100
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{w.text}</p>
                    {w.feedback?.overallFeedback && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{w.feedback.overallFeedback}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
