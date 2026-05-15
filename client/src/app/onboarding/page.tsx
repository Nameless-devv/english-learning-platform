'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Target, ChevronRight, CheckCircle, Trophy, RotateCcw } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── Placement test — 2 questions per CEFR level (A1 → C2) ───────────────────
const QUESTIONS = [
  // ── A1: Everyday survival words ─────────────────────────────────────────
  {
    level: 'A1',
    q: "What does 'hungry' mean?",
    options: ['och', 'kasal', 'charchagan', 'xursand'],
    answer: 'och',
  },
  {
    level: 'A1',
    q: "What does 'fast' mean?",
    options: ['katta', 'yangi', 'tez', 'issiq'],
    answer: 'tez',
  },

  // ── A2: Common functional vocabulary ────────────────────────────────────
  {
    level: 'A2',
    q: "What does 'improve' mean?",
    options: ['unutmoq', 'yaxshilamoq', 'topmoq', "o'chirmoq"],
    answer: 'yaxshilamoq',
  },
  {
    level: 'A2',
    q: "What does 'nervous' mean?",
    options: ['xursand', "g'amgin", 'charchagan', 'asabiy'],
    answer: 'asabiy',
  },

  // ── B1: Intermediate — topic-based vocabulary ────────────────────────────
  {
    level: 'B1',
    q: "What does 'opportunity' mean?",
    options: ['muammo', 'natija', 'xavf', 'imkoniyat'],
    answer: 'imkoniyat',
  },
  {
    level: 'B1',
    q: "What does 'convince' mean?",
    options: ["so'ramoq", "taklif qilmoq", 'ishontirmoq', "qo'rqitmoq"],
    answer: 'ishontirmoq',
  },

  // ── B2: Upper-intermediate — abstract & academic words ───────────────────
  {
    level: 'B2',
    q: "What does 'inevitable' mean?",
    options: ['kutilmagan', 'shoshilinch', 'noaniq', 'muqarrar'],
    answer: 'muqarrar',
  },
  {
    level: 'B2',
    q: "What does 'reluctant' mean?",
    options: ["g'ayratli", 'shoshqaloq', 'istamaydigan', 'befarq'],
    answer: 'istamaydigan',
  },

  // ── C1: Advanced — nuanced academic / literary vocabulary ────────────────
  {
    level: 'C1',
    q: "What does 'meticulous' mean?",
    options: ['beparvo', 'shoshqaloq', 'ijodiy', 'juda puxta va diqqatli'],
    answer: 'juda puxta va diqqatli',
  },
  {
    level: 'C1',
    q: "What does 'pervasive' mean?",
    options: ['kamdan-kam uchraydigan', 'qimmatbaho', 'noaniq', 'hamma joyda tarqalgan'],
    answer: 'hamma joyda tarqalgan',
  },

  // ── C2: Mastery — rare / sophisticated vocabulary ────────────────────────
  {
    level: 'C2',
    q: "What does 'perspicacious' mean?",
    options: ['yuzaki fikrlovchi', 'befarq', 'juda zukko va kuchli zehnli', 'tartibsiz'],
    answer: 'juda zukko va kuchli zehnli',
  },
  {
    level: 'C2',
    q: "What does 'recalcitrant' mean?",
    options: ['itoatkor', 'befarq', "qo'rqoq", "itoatsiz va bo'ysunmaydigan"],
    answer: "itoatsiz va bo'ysunmaydigan",
  },
];

function scoreToLevel(score: number): string {
  // 12 questions total, 2 per level
  if (score <= 2)  return 'A1';
  if (score <= 4)  return 'A2';
  if (score <= 6)  return 'B1';
  if (score <= 8)  return 'B2';
  if (score <= 10) return 'C1';
  return 'C2';
}

const LEVEL_DESCRIPTIONS: Record<string, { label: string; desc: string; color: string }> = {
  A1: { label: 'Boshlang\'ich', desc: "Ingliz tilini endigina boshlayapsiz. Asosiy so'zlar va iboralarni o'rganamiz.", color: 'text-gray-600 bg-gray-100' },
  A2: { label: 'Elementar', desc: "Oddiy jumlalar va kundalik vaziyatlarda muloqot qila olasiz.", color: 'text-blue-600 bg-blue-100' },
  B1: { label: 'O\'rta', desc: "Tanish mavzularda mulohaza yuritish va tushuncha bildira olasiz.", color: 'text-green-600 bg-green-100' },
  B2: { label: 'O\'rta yuqori', desc: "Murakkab matnlarni tushunasiz va ravon muloqot qila olasiz.", color: 'text-yellow-700 bg-yellow-100' },
  C1: { label: 'Ilg\'or', desc: "Murakkab mavzularda erkin va aniq fikr bildira olasiz.", color: 'text-orange-600 bg-orange-100' },
  C2: { label: 'Yuqori', desc: "Ingliz tilini deyarli ona tilidek biласiz. Mukammal daraja!", color: 'text-purple-600 bg-purple-100' },
};

const DAILY_GOAL_OPTIONS = [
  { value: 5,  label: '5 ta so\'z', sublabel: 'Yengil — 5 daqiqa/kun', emoji: '🌱' },
  { value: 10, label: '10 ta so\'z', sublabel: 'O\'rtacha — 10 daqiqa/kun', emoji: '🔥' },
  { value: 15, label: '15 ta so\'z', sublabel: 'Faol — 15 daqiqa/kun', emoji: '⚡' },
  { value: 20, label: '20 ta so\'z', sublabel: 'Jadal — 20 daqiqa/kun', emoji: '🚀' },
];

type Step = 'goal' | 'test' | 'result';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [step, setStep] = useState<Step>('goal');
  const [dailyGoal, setDailyGoal] = useState(10);

  // Test state
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Result state
  const [saving, setSaving] = useState(false);

  const score = answers.filter((a, i) => a === QUESTIONS[i].answer).length;
  const detectedLevel = scoreToLevel(score);

  const handleSelectAnswer = (opt: string) => {
    if (confirmed) return;
    setSelected(opt);
  };

  const handleConfirm = () => {
    if (!selected) return;
    setConfirmed(true);
    setTimeout(() => {
      const next = current + 1;
      if (next >= QUESTIONS.length) {
        setAnswers((prev) => [...prev, selected]);
        setStep('result');
      } else {
        setAnswers((prev) => [...prev, selected]);
        setCurrent(next);
        setSelected(null);
        setConfirmed(false);
      }
    }, 700);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        dailyGoal,
        englishLevel: detectedLevel,
        onboardingDone: true,
      });
      if (user) {
        setUser({ ...user, ...updated } as any);
      }
      toast.success("Ajoyib! Muvaffaqiyatlar yo'lida oldinga!");
      router.push('/dashboard');
    } catch {
      toast.error('Saqlashda xato yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const levelMeta = LEVEL_DESCRIPTIONS[detectedLevel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary-700 font-bold text-2xl mb-3">
            <BookOpen className="w-7 h-7" />
            ELP
          </div>
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {(['goal', 'test', 'result'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step === s
                    ? 'bg-primary-600 text-white scale-110'
                    : (step === 'result' || (step === 'test' && s === 'goal'))
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400',
                )}>
                  {(step === 'result' && s !== 'result') || (step === 'test' && s === 'goal')
                    ? '✓'
                    : i + 1}
                </div>
                {i < 2 && <div className={cn('w-8 h-0.5', i === 0 && step !== 'goal' ? 'bg-green-400' : 'bg-gray-200')} />}
              </div>
            ))}
          </div>
        </div>

        {/* ── Step 1: Daily Goal ── */}
        {step === 'goal' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-6">
              <Target className="w-10 h-10 text-primary-500 mx-auto mb-3" />
              <h1 className="text-xl font-bold text-gray-900">Kunlik maqsadingiz</h1>
              <p className="text-gray-500 text-sm mt-1">Har kuni nechta yangi so'z o'rganmoqchisiz?</p>
            </div>

            <div className="space-y-3">
              {DAILY_GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDailyGoal(opt.value)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                    dailyGoal === opt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 bg-white hover:border-gray-200',
                  )}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className={cn('font-semibold', dailyGoal === opt.value ? 'text-primary-700' : 'text-gray-800')}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-400">{opt.sublabel}</p>
                  </div>
                  {dailyGoal === opt.value && (
                    <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('test')}
              className="w-full btn-primary mt-6 flex items-center justify-center gap-2 py-3 text-base"
            >
              Darajamni aniqlash
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ── Step 2: Placement Test ── */}
        {step === 'test' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Progress */}
            <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
              <span className="font-medium text-primary-600">{QUESTIONS[current].level}</span>
              <span>{current + 1} / {QUESTIONS.length}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${(current / QUESTIONS.length) * 100}%` }}
              />
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Savol {current + 1}</p>
              <h2 className="text-lg font-bold text-gray-900">{QUESTIONS[current].q}</h2>
            </div>

            <div className="space-y-2">
              {QUESTIONS[current].options.map((opt) => {
                let cls = 'border-gray-200 bg-white text-gray-700 hover:border-gray-300';
                if (confirmed) {
                  if (opt === QUESTIONS[current].answer)
                    cls = 'border-green-400 bg-green-50 text-green-800 font-semibold';
                  else if (opt === selected && opt !== QUESTIONS[current].answer)
                    cls = 'border-red-300 bg-red-50 text-red-700';
                  else
                    cls = 'border-gray-100 bg-gray-50 text-gray-400';
                } else if (opt === selected) {
                  cls = 'border-primary-500 bg-primary-50 text-primary-800 font-medium';
                }
                return (
                  <button
                    key={opt}
                    disabled={confirmed}
                    onClick={() => handleSelectAnswer(opt)}
                    className={cn('w-full text-left px-4 py-3 rounded-xl border text-sm transition-all', cls)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleConfirm}
              disabled={!selected || confirmed}
              className="w-full btn-primary mt-5 py-3 disabled:opacity-40"
            >
              {confirmed
                ? current + 1 >= QUESTIONS.length
                  ? 'Natijalarni ko\'rish...'
                  : 'Keyingi savol...'
                : 'Tasdiqlash'}
            </button>

            <button
              onClick={() => setStep('goal')}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3"
            >
              ← Orqaga
            </button>
          </div>
        )}

        {/* ── Step 3: Result ── */}
        {step === 'result' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-6">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h1 className="text-xl font-bold text-gray-900">Siz tayyor!</h1>
              <p className="text-gray-500 text-sm mt-1">
                {score}/{QUESTIONS.length} ta savolga to'g'ri javob berdingiz
              </p>
            </div>

            {/* Detected level */}
            <div className="rounded-xl border-2 border-primary-100 bg-primary-50 p-4 mb-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Sizning darajangiz</p>
              <span className={cn('inline-block text-2xl font-bold px-4 py-1 rounded-xl mb-2', levelMeta.color)}>
                {detectedLevel}
              </span>
              <p className="font-semibold text-gray-800">{levelMeta.label}</p>
              <p className="text-sm text-gray-500 mt-1">{levelMeta.desc}</p>
            </div>

            {/* Goal summary */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6 text-sm">
              <span className="text-xl">
                {DAILY_GOAL_OPTIONS.find((o) => o.value === dailyGoal)?.emoji}
              </span>
              <div>
                <p className="font-medium text-gray-800">Kunlik maqsad: {dailyGoal} ta so'z</p>
                <p className="text-xs text-gray-400">
                  {DAILY_GOAL_OPTIONS.find((o) => o.value === dailyGoal)?.sublabel}
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  O'rganishni boshlash
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              onClick={() => { setCurrent(0); setAnswers([]); setSelected(null); setConfirmed(false); setStep('test'); }}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Testni qayta topshirish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
