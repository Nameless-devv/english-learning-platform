'use client';

import { useState } from 'react';
import {
  GraduationCap, Search, RefreshCcw, CheckCircle2, XCircle,
  Lightbulb, ChevronRight, RotateCcw, Trophy,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { grammarService, GrammarLesson, Exercise } from '@/services/grammar.service';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const PRESET_TOPICS = [
  { emoji: '⏰', label: 'Present Simple', value: 'Present Simple tense' },
  { emoji: '🔄', label: 'Present Continuous', value: 'Present Continuous tense' },
  { emoji: '📜', label: 'Past Simple', value: 'Past Simple tense' },
  { emoji: '🔮', label: 'Future tenses', value: 'Future tenses (will / going to)' },
  { emoji: '✅', label: 'Present Perfect', value: 'Present Perfect tense' },
  { emoji: '📝', label: 'Articles', value: 'Articles (a, an, the)' },
  { emoji: '🔗', label: 'Prepositions', value: 'Prepositions (in, on, at, by, for)' },
  { emoji: '🔁', label: 'Conditionals', value: 'Conditional sentences (if clauses)' },
  { emoji: '📢', label: 'Modal verbs', value: 'Modal verbs (can, could, should, must)' },
  { emoji: '🔀', label: 'Passive voice', value: 'Passive voice' },
  { emoji: '💬', label: 'Reported speech', value: 'Reported speech' },
  { emoji: '🔢', label: 'Comparatives', value: 'Comparatives and superlatives' },
];

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-gray-100 text-gray-700 border-gray-200',
  A2: 'bg-blue-50 text-blue-700 border-blue-200',
  B1: 'bg-green-50 text-green-700 border-green-200',
  B2: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  C1: 'bg-orange-50 text-orange-700 border-orange-200',
  C2: 'bg-purple-50 text-purple-700 border-purple-200',
};

const TYPE_ICONS: Record<string, string> = {
  fill_blank: '✏️',
  multiple_choice: '🔘',
  error_correction: '🔍',
  word_order: '🔀',
};

const TYPE_LABELS: Record<string, string> = {
  fill_blank: 'Bo\'sh joyni to\'ldiring',
  multiple_choice: 'To\'g\'ri javobni tanlang',
  error_correction: 'Xatoni toping va tuzating',
  word_order: 'So\'zlarni tartibga soling',
};

interface ExerciseState {
  userAnswer: string;
  submitted: boolean;
  correct: boolean | null;
  selectedOption: string | null;
}

function ExerciseCard({
  exercise,
  index,
  state,
  onChange,
  onSubmit,
}: {
  exercise: Exercise;
  index: number;
  state: ExerciseState;
  onChange: (val: string) => void;
  onSubmit: () => void;
}) {
  const { type, question, options, answer, explanation } = exercise;
  const { userAnswer, submitted, correct, selectedOption } = state;

  const wordOrderWords = type === 'word_order'
    ? question.split(':').pop()?.split('/').map((w) => w.trim()).filter(Boolean) ?? []
    : [];

  return (
    <div className={cn(
      'card border-2 transition-all',
      submitted
        ? correct ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
        : 'border-gray-100',
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{TYPE_ICONS[type]}</span>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{TYPE_LABELS[type]}</span>
        <span className="ml-auto text-sm font-bold text-gray-400">#{index + 1}</span>
      </div>

      {/* Question */}
      <p className="text-gray-800 font-medium mb-4 leading-relaxed">
        {type === 'word_order'
          ? question.split(':')[0] + ':'
          : question}
      </p>

      {/* Word chips for word_order */}
      {type === 'word_order' && wordOrderWords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
          {wordOrderWords.map((w, i) => (
            <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
              {w}
            </span>
          ))}
        </div>
      )}

      {/* Input area */}
      {!submitted && (
        <>
          {type === 'multiple_choice' && options ? (
            <div className="space-y-2 mb-4">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onChange(opt)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
                    selectedOption === opt
                      ? 'border-primary-500 bg-primary-50 text-primary-800 font-medium'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && userAnswer.trim() && onSubmit()}
              placeholder={
                type === 'fill_blank' ? 'Javobingizni yozing...' :
                type === 'error_correction' ? 'To\'g\'rilangan gapni yozing...' :
                'So\'zlarni to\'g\'ri tartibda yozing...'
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400 mb-4"
            />
          )}

          <button
            onClick={onSubmit}
            disabled={!userAnswer.trim() && !selectedOption}
            className="btn-primary text-sm py-2 px-5 disabled:opacity-40"
          >
            Tekshirish
          </button>
        </>
      )}

      {/* Result */}
      {submitted && (
        <div className="space-y-3">
          <div className={cn(
            'flex items-start gap-2 p-3 rounded-xl',
            correct ? 'bg-green-100' : 'bg-red-100',
          )}>
            {correct
              ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
            <div>
              <p className={cn('font-semibold text-sm', correct ? 'text-green-800' : 'text-red-700')}>
                {correct ? 'To\'g\'ri!' : 'Noto\'g\'ri'}
              </p>
              {!correct && (
                <p className="text-sm text-red-700 mt-0.5">
                  To'g'ri javob: <strong>{answer}</strong>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GrammarPage() {
  const [keyword, setKeyword] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('B1');
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<ExerciseState[]>([]);

  const generate = async (topic: string) => {
    if (!topic.trim()) { toast.error('Mavzu kiriting'); return; }
    setLoading(true);
    setLesson(null);
    try {
      const result = await grammarService.generate(topic.trim(), selectedLevel);
      setLesson(result);
      setStates(result.exercises.map(() => ({ userAnswer: '', submitted: false, correct: null, selectedOption: null })));
    } catch {
      toast.error('Mashqlar yaratishda xato. Qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, val: string) => {
    setStates((prev) => prev.map((s, i) =>
      i === index
        ? { ...s, userAnswer: val, selectedOption: lesson?.exercises[i].type === 'multiple_choice' ? val : s.selectedOption }
        : s,
    ));
  };

  const handleSubmit = (index: number) => {
    if (!lesson) return;
    const exercise = lesson.exercises[index];
    const state = states[index];
    const given = (state.userAnswer || state.selectedOption || '').trim().toLowerCase();
    const expected = exercise.answer.trim().toLowerCase();

    const correct =
      given === expected ||
      expected.includes(given) ||
      given.includes(expected.split(' ').slice(0, 2).join(' '));

    setStates((prev) => prev.map((s, i) =>
      i === index ? { ...s, submitted: true, correct } : s,
    ));

  };

  const score = states.filter((s) => s.correct === true).length;
  const total = states.filter((s) => s.submitted).length;
  const allSubmitted = lesson && states.every((s) => s.submitted);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="page-container max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-6 h-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Grammatika mashqlari</h1>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Mavzu tanlang — AI sizning darajangizga mos 8 ta mashq yaratadi.
          </p>

          {/* Controls */}
          <div className="card mb-4">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generate(keyword)}
                placeholder="Grammatika mavzusi... (masalan: Past Simple, articles)"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                disabled={loading}
              />
              <button
                onClick={() => generate(keyword)}
                disabled={loading || !keyword.trim()}
                className="btn-primary flex items-center gap-2 px-5 disabled:opacity-40"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Yaratilmoqda...' : 'Boshlash'}
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">Daraja:</span>
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
                    selectedLevel === lvl
                      ? LEVEL_COLORS[lvl] + ' ring-2 ring-offset-1 ring-primary-400'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300',
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Preset topics */}
          {!lesson && !loading && (
            <div className="mb-6">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Tezkor tanlash</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_TOPICS.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => { setKeyword(topic.value); generate(topic.value); }}
                    className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-sm text-gray-600 hover:text-primary-700 text-left"
                  >
                    <span className="text-xl shrink-0">{topic.emoji}</span>
                    <span className="font-medium leading-tight">{topic.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="card animate-pulse space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-5 bg-gray-100 rounded w-4/5" />
                  <div className="space-y-2">
                    {[1,2,3,4].map((j) => <div key={j} className="h-10 bg-gray-100 rounded-xl" />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lesson */}
          {lesson && !loading && (
            <div className="space-y-4">
              {/* Header */}
              <div className="card flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-gray-900">{lesson.topic}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', LEVEL_COLORS[lesson.level])}>
                      {lesson.level}
                    </span>
                    <span className="text-xs text-gray-400">{lesson.exercises.length} ta mashq</span>
                    {total > 0 && (
                      <span className="text-xs font-semibold text-primary-600">
                        {score}/{total} to'g'ri
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setLesson(null)}
                  className="btn-secondary flex items-center gap-1.5 text-sm shrink-0"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Yangi
                </button>
              </div>

              {/* Grammar tip */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Qoida</p>
                  <p className="text-sm text-amber-800">{lesson.tip}</p>
                </div>
              </div>

              {/* Exercises */}
              {lesson.exercises.map((ex, i) => (
                <ExerciseCard
                  key={i}
                  exercise={ex}
                  index={i}
                  state={states[i]}
                  onChange={(val) => handleChange(i, val)}
                  onSubmit={() => handleSubmit(i)}
                />
              ))}

              {/* Final score */}
              {allSubmitted && (
                <div className={cn(
                  'card text-center py-8 border-2',
                  score >= lesson.exercises.length * 0.8 ? 'border-green-200 bg-green-50' :
                  score >= lesson.exercises.length * 0.5 ? 'border-yellow-200 bg-yellow-50' :
                  'border-red-200 bg-red-50',
                )}>
                  <Trophy className={cn(
                    'w-12 h-12 mx-auto mb-3',
                    score >= lesson.exercises.length * 0.8 ? 'text-green-500' :
                    score >= lesson.exercises.length * 0.5 ? 'text-yellow-500' : 'text-red-400',
                  )} />
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {score}/{lesson.exercises.length}
                  </h3>
                  <p className="text-gray-600 text-sm mb-5">
                    {score >= lesson.exercises.length * 0.8 ? 'Ajoyib! Siz bu mavzuni yaxshi bilasiz.' :
                     score >= lesson.exercises.length * 0.5 ? 'Yaxshi! Bir oz ko\'proq mashq kerak.' :
                     'Ko\'proq mashq qiling. Davom eting!'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setStates(lesson.exercises.map(() => ({
                          userAnswer: '', submitted: false, correct: null, selectedOption: null,
                        })));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Qaytadan
                    </button>
                    <button
                      onClick={() => { setLesson(null); setKeyword(''); }}
                      className="btn-primary flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      Yangi mavzu
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

