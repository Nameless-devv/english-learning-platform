'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpen, RotateCcw, CheckCircle, Clock, Volume2, Tag,
  FlaskConical, ChevronRight, Trophy, XCircle, CheckCircle2,
  Shuffle, AlignLeft, Target, TrendingUp,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Flashcard } from '@/components/flashcard/Flashcard';
import { learningService } from '@/services/learning.service';
import { useDailyPlan } from '@/hooks/useDailyPlan';
import { useSpeech } from '@/hooks/useSpeech';
import { Word, VocabularyStats } from '@/types';
import { t } from '@/lib/i18n';
import { getLevelColor, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type Tab = 'flashcard' | 'all' | 'test';
type TestMode = 'setup' | 'quiz' | 'result';
type TestDirection = 'en_to_uz' | 'uz_to_en';
type TestType = 'multiple_choice' | 'typing';

const CATEGORY_META: Record<string, { emoji: string; name: string }> = {
  food:        { emoji: '🍎', name: 'Ovqat' },
  animals:     { emoji: '🐾', name: 'Hayvonlar' },
  travel:      { emoji: '✈️', name: 'Sayohat' },
  technology:  { emoji: '💻', name: 'Texnologiya' },
  sports:      { emoji: '⚽', name: 'Sport' },
  health:      { emoji: '🏥', name: 'Salomatlik' },
  education:   { emoji: '📚', name: "Ta'lim" },
  business:    { emoji: '💼', name: 'Biznes' },
  nature:      { emoji: '🌿', name: 'Tabiat' },
  family:      { emoji: '👨‍👩‍👧', name: 'Oila' },
  emotions:    { emoji: '😊', name: "His-tuyg'ular" },
  house:       { emoji: '🏠', name: 'Uy' },
  clothes:     { emoji: '👕', name: 'Kiyim' },
  body:        { emoji: '💪', name: 'Tana' },
  time:        { emoji: '⏰', name: 'Vaqt' },
  weather:     { emoji: '🌤', name: 'Ob-havo' },
  reading:     { emoji: '📖', name: "O'qish" },
};

function getCategoryLabel(cat?: string) {
  if (!cat) return null;
  const m = CATEGORY_META[cat.toLowerCase()];
  return m ? `${m.emoji} ${m.name}` : `📌 ${cat}`;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildOptions(correct: string, pool: string[]): string[] {
  const distractors = shuffle(pool.filter((w) => w !== correct)).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

// ── Daily Goal Card ───────────────────────────────────────────────────────────
function DailyGoalCard({
  total,
  completed,
  newCount,
  reviewCount,
}: {
  total: number;
  completed: number;
  newCount: number;
  reviewCount: number;
}) {
  const pct = total === 0 ? 100 : Math.min(100, Math.round((completed / total) * 100));
  const done = total > 0 && completed >= total;
  const r = 26;
  const circ = 2 * Math.PI * r;

  return (
    <div className={cn(
      'card border-2 mb-4',
      done ? 'border-green-200 bg-green-50' : 'border-primary-100 bg-white',
    )}>
      <div className="flex items-center gap-4">
        {/* SVG circle progress */}
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle
              cx="32" cy="32" r={r} fill="none"
              stroke={done ? '#22c55e' : '#3b82f6'}
              strokeWidth="6"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">{pct}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm">
            {total === 0
              ? "Bugun barcha so'zlar tayyor!"
              : done
              ? '🎉 Bugungi maqsad bajarildi!'
              : 'Bugungi maqsad'}
          </h3>
          {total > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              <strong>{completed}</strong>/{total} ta so'z
            </p>
          )}
          <div className="flex gap-3 mt-1.5 text-xs">
            {newCount > 0 && <span className="text-blue-600">✨ {newCount} ta yangi</span>}
            {reviewCount > 0 && <span className="text-purple-600">🔁 {reviewCount} ta takrorlash</span>}
          </div>
        </div>

        {done && <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />}
        {!done && total > 0 && (
          <Target className="w-6 h-6 text-primary-400 shrink-0" />
        )}
      </div>
    </div>
  );
}

// ── Review Alert ──────────────────────────────────────────────────────────────
function ReviewAlert({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl mb-4 text-sm">
      <Clock className="w-5 h-5 text-orange-500 shrink-0" />
      <div>
        <span className="font-semibold text-orange-800">{count} ta so'z takrorlash vaqti keldi!</span>
        <span className="text-orange-600 ml-1">Flashcard rejimida bular ko'rsatiladi.</span>
      </div>
    </div>
  );
}

// ── Category Progress Grid ────────────────────────────────────────────────────
function CategoryProgressGrid({ allWords, myWords }: { allWords: Word[]; myWords: Word[] }) {
  const myWordIds = useMemo(() => new Set(myWords.map((w) => w.id)), [myWords]);

  const categories = useMemo(() => {
    return Array.from(new Set(allWords.map((w) => w.category).filter(Boolean) as string[])).sort();
  }, [allWords]);

  if (categories.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Kategoriya bo'yicha progress
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const catWords = allWords.filter((w) => w.category === cat);
          const learned = catWords.filter((w) => myWordIds.has(w.id)).length;
          const pct = catWords.length === 0 ? 0 : Math.round((learned / catWords.length) * 100);
          const meta = CATEGORY_META[cat.toLowerCase()];
          const barColor = pct >= 70 ? 'bg-green-500' : pct >= 30 ? 'bg-blue-500' : 'bg-gray-300';

          return (
            <div key={cat} className="card p-3">
              <div className="text-xl mb-1">{meta?.emoji ?? '📌'}</div>
              <p className="text-xs font-semibold text-gray-700 truncate">
                {meta?.name ?? cat}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', barColor)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                <strong className={pct >= 70 ? 'text-green-600' : 'text-gray-600'}>{learned}</strong>/{catWords.length}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Test component ────────────────────────────────────────────────────────────
function VocabTest({
  allWords,
  myWords,
  onExit,
}: {
  allWords: Word[];
  myWords: Word[];
  onExit: () => void;
}) {
  const [pool, setPool] = useState<'all' | 'my'>('my');
  const [direction, setDirection] = useState<TestDirection>('en_to_uz');
  const [testType, setTestType] = useState<TestType>('multiple_choice');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [questionCount, setQuestionCount] = useState<10 | 15 | 20>(10);
  const [mode, setMode] = useState<TestMode>('setup');

  const [questions, setQuestions] = useState<Word[]>([]);
  const [current, setCurrent] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ word: Word; correct: boolean; given: string }[]>([]);

  const { speak, speaking } = useSpeech();

  const sourceWords = pool === 'my' ? myWords : allWords;

  const categories = useMemo(() => {
    const cats = new Set(sourceWords.map((w) => w.category).filter(Boolean) as string[]);
    return Array.from(cats).sort();
  }, [sourceWords]);

  const levels = useMemo(() => {
    const lvls = new Set(sourceWords.map((w) => w.level).filter(Boolean));
    return Array.from(lvls).sort();
  }, [sourceWords]);

  const filtered = useMemo(() => {
    return sourceWords.filter((w) => {
      if (filterCategory !== 'all' && w.category !== filterCategory) return false;
      if (filterLevel !== 'all' && w.level !== filterLevel) return false;
      return true;
    });
  }, [sourceWords, filterCategory, filterLevel]);

  const startTest = () => {
    if (filtered.length < 2) {
      toast.error("Test uchun kamida 2 ta so'z kerak");
      return;
    }
    setQuestions(shuffle(filtered).slice(0, Math.min(questionCount, filtered.length)));
    setCurrent(0);
    setResults([]);
    setUserInput('');
    setSelected(null);
    setSubmitted(false);
    setMode('quiz');
  };

  const allTranslations = useMemo(
    () => allWords.map((w) => (direction === 'en_to_uz' ? w.translation : w.word)),
    [allWords, direction],
  );

  const currentWord = questions[current];
  const question = currentWord ? (direction === 'en_to_uz' ? currentWord.word : currentWord.translation) : '';
  const answer = currentWord ? (direction === 'en_to_uz' ? currentWord.translation : currentWord.word) : '';
  const options = useMemo(
    () => (currentWord ? buildOptions(answer, allTranslations) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current, questions],
  );

  const handleSubmit = useCallback(() => {
    if (!currentWord) return;
    const given = (selected ?? userInput).trim().toLowerCase();
    const correct =
      given === answer.toLowerCase() ||
      answer.toLowerCase().includes(given) ||
      given.includes(answer.toLowerCase().split(' ')[0]);
    setResults((prev) => [...prev, { word: currentWord, correct, given: selected ?? userInput }]);
    setSubmitted(true);
  }, [currentWord, selected, userInput, answer]);

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setMode('result');
    } else {
      setCurrent((c) => c + 1);
      setUserInput('');
      setSelected(null);
      setSubmitted(false);
    }
  };

  const score = results.filter((r) => r.correct).length;

  if (mode === 'setup') {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary-500" />
            Test sozlamalari
          </h2>

          <div className="space-y-5">
            {/* Pool selector */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">So'zlar manbai</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setPool('my'); setFilterCategory('all'); setFilterLevel('all'); }}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-sm font-medium border transition-all text-center',
                    pool === 'my'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300',
                  )}
                >
                  <span className="block font-semibold">📚 Mening so'zlarim</span>
                  <span className={cn('text-xs', pool === 'my' ? 'text-primary-100' : 'text-gray-400')}>
                    {myWords.length} ta yod olganlarim
                  </span>
                </button>
                <button
                  onClick={() => { setPool('all'); setFilterCategory('all'); setFilterLevel('all'); }}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-sm font-medium border transition-all text-center',
                    pool === 'all'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300',
                  )}
                >
                  <span className="block font-semibold">🌐 Barcha so'zlar</span>
                  <span className={cn('text-xs', pool === 'all' ? 'text-primary-100' : 'text-gray-400')}>
                    {allWords.length} ta so'z
                  </span>
                </button>
              </div>
            </div>

            {/* Question count */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Savollar soni</p>
              <div className="flex gap-2">
                {([10, 15, 20] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                      questionCount === n
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300',
                    )}
                  >
                    {n} ta
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            {categories.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Kategoriya bo'yicha</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      filterCategory === 'all'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300',
                    )}
                  >
                    Barchasi ({sourceWords.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        filterCategory === cat
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300',
                      )}
                    >
                      {getCategoryLabel(cat)} ({sourceWords.filter((w) => w.category === cat).length})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Level filter */}
            {levels.length > 1 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Daraja bo'yicha</p>
                <div className="flex flex-wrap gap-2">
                  {['all', ...levels].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setFilterLevel(lvl)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                        filterLevel === lvl
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300',
                      )}
                    >
                      {lvl === 'all' ? 'Barcha darajalar' : lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Direction */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Test yo'nalishi</p>
              <div className="flex gap-2">
                {(
                  [
                    ['en_to_uz', "🇬🇧 → 🇺🇿 Inglizcha → O'zbek"],
                    ['uz_to_en', "🇺🇿 → 🇬🇧 O'zbek → Inglizcha"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setDirection(val)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all',
                      direction === val
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Test type */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Test turi</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTestType('multiple_choice')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all',
                    testType === 'multiple_choice'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300',
                  )}
                >
                  <Shuffle className="w-4 h-4" />
                  Ko'p tanlov
                </button>
                <button
                  onClick={() => setTestType('typing')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all',
                    testType === 'typing'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300',
                  )}
                >
                  <AlignLeft className="w-4 h-4" />
                  Yozish
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <strong className="text-gray-800">{Math.min(questionCount, filtered.length)}</strong> ta savol
              <span className="text-gray-400"> ({filtered.length} ta mos so'z)</span>
            </p>
            <button
              onClick={startTest}
              disabled={filtered.length < 2}
              className="btn-primary flex items-center gap-2 disabled:opacity-40"
            >
              <FlaskConical className="w-4 h-4" />
              Testni boshlash
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'result') {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div
          className={cn(
            'card text-center py-8 border-2',
            score >= questions.length * 0.8
              ? 'border-green-200 bg-green-50'
              : score >= questions.length * 0.5
              ? 'border-yellow-200 bg-yellow-50'
              : 'border-red-200 bg-red-50',
          )}
        >
          <Trophy
            className={cn(
              'w-14 h-14 mx-auto mb-3',
              score >= questions.length * 0.8
                ? 'text-green-500'
                : score >= questions.length * 0.5
                ? 'text-yellow-500'
                : 'text-red-400',
            )}
          />
          <h2 className="text-2xl font-bold text-gray-900">
            {score}/{questions.length}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {score >= questions.length * 0.8
              ? "Ajoyib natija! Siz bu so'zlarni yaxshi bilasiz."
              : score >= questions.length * 0.5
              ? "Yaxshi! Kamroq bilgan so'zlarni takrorlang."
              : "Ko'proq mashq qiling. Quyida xatolar ko'rsatilgan."}
          </p>
          <div className="flex gap-3 justify-center mt-5">
            <button onClick={() => setMode('setup')} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Qayta sozlash
            </button>
            <button onClick={startTest} className="btn-primary flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              Qayta boshlash
            </button>
          </div>
        </div>

        {results.filter((r) => !r.correct).length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Xatolar ({results.filter((r) => !r.correct).length} ta)
            </h3>
            <div className="space-y-2">
              {results
                .filter((r) => !r.correct)
                .map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-xl text-sm border border-red-100"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speak(r.word.word)}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-gray-900">{r.word.word}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-700 font-medium">{r.word.translation}</span>
                    </div>
                    {r.given && (
                      <span className="text-red-500 text-xs line-through">{r.given}</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        <button onClick={onExit} className="btn-secondary flex items-center gap-2 mx-auto text-sm">
          Lug'atga qaytish
        </button>
      </div>
    );
  }

  // Quiz mode
  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
        <span>
          {current + 1} / {questions.length}
        </span>
        <button
          onClick={() => setMode('setup')}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Chiqish
        </button>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-300"
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>

      <div className="card">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          {direction === 'en_to_uz' ? "Inglizchadan o'zbekchaga" : "O'zbekchadan inglizchaga"}
        </p>

        {/* Question with audio */}
        <div className="flex items-start gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex-1">{question}</h2>
          {direction === 'en_to_uz' && currentWord && (
            <button
              onClick={() => speak(currentWord.word)}
              className={cn(
                'p-2 rounded-xl border transition-colors shrink-0 mt-0.5',
                speaking
                  ? 'bg-primary-50 border-primary-300 text-primary-600'
                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-200',
              )}
              title="Talaffuzni eshit"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Example hint (shown after submit) */}
        {submitted && currentWord?.example && (
          <div className="mb-4 px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-500 italic border border-gray-100">
            "{currentWord.example}"
            {currentWord.exampleUz && (
              <span className="block text-gray-400 not-italic mt-0.5">"{currentWord.exampleUz}"</span>
            )}
          </div>
        )}

        {testType === 'multiple_choice' ? (
          <div className="space-y-2 mb-4">
            {options.map((opt) => {
              let cls = 'border-gray-200 bg-white text-gray-700 hover:border-gray-300';
              if (submitted) {
                if (opt === answer)
                  cls = 'border-green-400 bg-green-50 text-green-800 font-semibold';
                else if (opt === selected && opt !== answer)
                  cls = 'border-red-300 bg-red-50 text-red-700';
                else cls = 'border-gray-100 bg-gray-50 text-gray-400';
              } else if (opt === selected) {
                cls = 'border-primary-500 bg-primary-50 text-primary-800 font-medium';
              }
              return (
                <button
                  key={opt}
                  disabled={submitted}
                  onClick={() => !submitted && setSelected(opt)}
                  className={cn('w-full text-left px-4 py-3 rounded-xl border text-sm transition-all', cls)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mb-4">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && !submitted && userInput.trim() && handleSubmit()
              }
              disabled={submitted}
              placeholder="Javobingizni yozing..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400 disabled:bg-gray-50"
              autoFocus
            />
            {submitted && (
              <div
                className={cn(
                  'mt-2 px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2',
                  results[results.length - 1]?.correct
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-700',
                )}
              >
                {results[results.length - 1]?.correct ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                {results[results.length - 1]?.correct
                  ? "To'g'ri!"
                  : `To'g'ri javob: ${answer}`}
              </div>
            )}
          </div>
        )}

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selected && !userInput.trim()}
            className="btn-primary w-full disabled:opacity-40"
          >
            Tekshirish
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {current + 1 >= questions.length ? (
              <>
                <Trophy className="w-4 h-4" /> Natijalarni ko'rish
              </>
            ) : (
              <>
                Keyingi <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VocabularyPage() {
  const [tab, setTab] = useState<Tab>('flashcard');
  const { dailyPlan, loading, completeWord, resetPlan } = useDailyPlan();
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [myWords, setMyWords] = useState<Word[]>([]);
  const [stats, setStats] = useState<VocabularyStats | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { speak, speaking } = useSpeech();

  const allPlanWords = dailyPlan ? [...dailyPlan.newWords, ...dailyPlan.reviewWords] : [];
  const currentWord = allPlanWords[cardIndex] ?? null;

  useEffect(() => {
    Promise.all([
      learningService.getAllWords(),
      learningService.getVocabularyStats(),
      learningService.getMyWords(),
    ]).then(([words, s, my]) => {
      setAllWords(words);
      setStats(s);
      setMyWords(my);
    });
  }, []);

  useEffect(() => {
    setCardIndex(0);
    setSessionDone(false);
  }, [dailyPlan?.id]);

  const categories = useMemo(() => {
    const cats = new Set(allWords.map((w) => w.category).filter(Boolean) as string[]);
    return Array.from(cats).sort();
  }, [allWords]);

  const filteredWords = useMemo(() => {
    if (selectedCategory === 'all') return allWords;
    return allWords.filter((w) => w.category === selectedCategory);
  }, [allWords, selectedCategory]);

  const groupedWords = useMemo(() => {
    if (selectedCategory !== 'all') return { [selectedCategory]: filteredWords };
    const groups: Record<string, Word[]> = {};
    const uncategorized: Word[] = [];
    for (const w of allWords) {
      if (w.category) {
        groups[w.category] = groups[w.category] ?? [];
        groups[w.category].push(w);
      } else {
        uncategorized.push(w);
      }
    }
    if (uncategorized.length) groups[''] = uncategorized;
    return groups;
  }, [allWords, selectedCategory, filteredWords]);

  const handleKnow = async () => {
    if (!currentWord) return;
    await Promise.all([
      learningService.reviewWord(currentWord.id, true),
      completeWord(currentWord.planWordId),
    ]);
    toast.success('Toʻgʻri! +10 XP', { icon: '🎉' });
    nextCard();
  };

  const handleDontKnow = async () => {
    if (!currentWord) return;
    await learningService.reviewWord(currentWord.id, false);
    toast("Keyingi safar yaxshiroq!", { icon: '💪' });
    nextCard();
  };

  const nextCard = () => {
    const next = cardIndex + 1;
    if (next >= allPlanWords.length) setSessionDone(true);
    else setCardIndex(next);
  };

  const resetSession = async () => {
    setCardIndex(0);
    setSessionDone(false);
    await resetPlan();
  };

  const isNewWord = (index: number) => (dailyPlan ? index < dailyPlan.newWords.length : false);

  const completedToday = sessionDone ? allPlanWords.length : cardIndex;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'flashcard', label: 'Kartochkalar' },
    { id: 'all', label: "Barcha so'zlar" },
    { id: 'test', label: 'Test' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="page-container">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t.vocabulary.title}</h1>
            {stats && (
              <div className="hidden sm:flex items-center gap-3 text-sm">
                <span className="text-gray-500">
                  {t.vocabulary.learned}:{' '}
                  <strong>
                    {stats.learned}
                  </strong>
                  /{stats.total}
                </span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-100 w-fit">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  tab === id ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Flashcard tab ── */}
          {tab === 'flashcard' && (
            <div className="max-w-lg mx-auto">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Daily goal */}
                  {!loading && (
                    <DailyGoalCard
                      total={allPlanWords.length}
                      completed={completedToday}
                      newCount={dailyPlan?.newWords.length ?? 0}
                      reviewCount={dailyPlan?.reviewWords.length ?? 0}
                    />
                  )}

                  {/* Review alert */}
                  {stats && stats.dueToday > (dailyPlan?.reviewWords.length ?? 0) && (
                    <ReviewAlert
                      count={stats.dueToday - (dailyPlan?.reviewWords.length ?? 0)}
                    />
                  )}

                  {sessionDone || allPlanWords.length === 0 ? (
                    <div className="text-center py-16 card">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {allPlanWords.length === 0
                          ? "Bugun barcha so'zlar bajarildi!"
                          : 'Sessiya tugadi!'}
                      </h2>
                      <p className="text-gray-500 mb-6">Ajoyib ish! Ertaga davom eting.</p>
                      <button
                        onClick={resetSession}
                        className="btn-secondary flex items-center gap-2 mx-auto"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Qaytadan boshlash
                      </button>
                    </div>
                  ) : currentWord ? (
                    <div>
                      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                        <span>
                          {cardIndex + 1} / {allPlanWords.length}
                        </span>
                        <div className="flex items-center gap-2">
                          {currentWord.category && (
                            <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              <Tag className="w-3 h-3" />
                              {getCategoryLabel(currentWord.category)}
                            </span>
                          )}
                          <span
                            className={cn(
                              'px-2 py-1 rounded-lg text-xs font-medium',
                              isNewWord(cardIndex)
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-purple-50 text-purple-600',
                            )}
                          >
                            {isNewWord(cardIndex) ? '✨ Yangi' : '🔁 Takrorlash'}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all duration-300"
                          style={{ width: `${(cardIndex / allPlanWords.length) * 100}%` }}
                        />
                      </div>
                      <Flashcard word={currentWord} onKnow={handleKnow} onDontKnow={handleDontKnow} />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}

          {/* ── All words tab ── */}
          {tab === 'all' && (
            <div>
              {/* Category progress grid */}
              <CategoryProgressGrid allWords={allWords} myWords={myWords} />

              {/* Category filter */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      selectedCategory === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300',
                    )}
                  >
                    Barchasi ({allWords.length})
                  </button>
                  {categories.map((cat) => {
                    const count = allWords.filter((w) => w.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                          selectedCategory === cat
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300',
                        )}
                      >
                        {getCategoryLabel(cat)} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              {Object.entries(groupedWords).map(([cat, words]) => (
                <div key={cat || 'other'} className="mb-8">
                  {selectedCategory === 'all' && (
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {cat ? getCategoryLabel(cat) : 'Kategoriyasiz'} ({words.length})
                    </h2>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {words.map((word) => (
                      <div key={word.id} className="card hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 text-lg">{word.word}</h3>
                              <button
                                onClick={() => speak(word.word)}
                                className={cn(
                                  'p-1 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors opacity-0 group-hover:opacity-100',
                                  speaking && 'opacity-100 text-primary-600',
                                )}
                                title="Talaffuzni eshit"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-primary-600 font-medium">{word.translation}</p>
                          </div>
                          <span
                            className={cn(
                              'text-xs font-semibold px-2 py-0.5 rounded-full ml-2 shrink-0',
                              getLevelColor(word.level),
                            )}
                          >
                            {word.level}
                          </span>
                        </div>
                        {word.example && (
                          <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-50 pt-2">
                            "{word.example}"
                          </p>
                        )}
                        {word.exampleUz && (
                          <p className="text-xs text-gray-400 mt-1">"{word.exampleUz}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredWords.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Hali so'zlar yo'q</p>
                </div>
              )}
            </div>
          )}

          {/* ── Test tab ── */}
          {tab === 'test' &&
            (allWords.length < 2 ? (
              <div className="text-center py-16 card max-w-md mx-auto">
                <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700 mb-2">Test uchun so'zlar yo'q</h3>
                <p className="text-gray-400 text-sm">
                  Hali lug'atda so'zlar yo'q. Admin so'z qo'shgandan so'ng test qilish mumkin.
                </p>
              </div>
            ) : (
              <VocabTest allWords={allWords} myWords={myWords} onExit={() => setTab('flashcard')} />
            ))}
        </main>
      </div>
    </ProtectedRoute>
  );
}
