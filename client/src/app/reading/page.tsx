'use client';

import { useState } from 'react';
import {
  BookMarked, Search, RefreshCcw, ChevronDown, ChevronUp,
  BookOpen, HelpCircle, Hash, Lightbulb, FileText,
  BookmarkPlus, BookmarkCheck, ExternalLink,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { readingService, ReadingPassage, VocabItem } from '@/services/reading.service';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const PRESET_TOPICS = [
  { emoji: '🌍', label: 'Sayohat', value: 'travel and exploring new places' },
  { emoji: '🤖', label: 'Texnologiya', value: 'artificial intelligence and technology' },
  { emoji: '🌿', label: 'Tabiat', value: 'nature and environment' },
  { emoji: '🏆', label: 'Sport', value: 'sports and famous athletes' },
  { emoji: '🍕', label: 'Ovqat', value: 'food culture around the world' },
  { emoji: '🎬', label: 'Kino', value: 'movies and filmmaking' },
  { emoji: '📚', label: 'Ta\'lim', value: 'education and learning' },
  { emoji: '💼', label: 'Biznes', value: 'entrepreneurship and startups' },
  { emoji: '🏥', label: 'Salomatlik', value: 'health and wellness' },
  { emoji: '🌌', label: 'Kosmik', value: 'space exploration and astronomy' },
  { emoji: '🎵', label: 'Musiqa', value: 'music history and genres' },
  { emoji: '🐾', label: 'Hayvonlar', value: 'animals and wildlife' },
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

const SOURCE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  adapted: { label: 'Asl asar asosida', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  original: { label: 'Haqiqiy ma\'lumotlar asosida', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ai: { label: 'AI tomonidan yaratilgan', color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const TYPE_LABELS: Record<string, string> = {
  article: '📰 Maqola',
  story: '📖 Hikoya',
  news: '📡 Yangilik',
  diary: '📔 Kundalik',
};

function QuestionCard({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <HelpCircle className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
        <span className="text-sm text-gray-800 flex-1">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
          <p className="text-sm text-green-800 bg-green-50 rounded-lg px-3 py-2 flex-1">{a}</p>
        </div>
      )}
    </div>
  );
}

function VocabCard({
  item,
  level,
  saved,
  onSave,
}: {
  item: VocabItem;
  level: string;
  saved: boolean;
  onSave: () => void;
}) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    await onSave();
    setSaving(false);
  };

  return (
    <div className={cn(
      'flex gap-3 p-3 rounded-xl border transition-all',
      saved ? 'bg-green-50 border-green-200' : 'bg-indigo-50 border-indigo-100',
    )}>
      <div className="flex-1 min-w-0">
        <p className={cn('font-bold text-sm', saved ? 'text-green-900' : 'text-indigo-900')}>{item.word}</p>
        <p className={cn('text-xs mt-0.5', saved ? 'text-green-700' : 'text-indigo-700')}>{item.definition}</p>
        <p className={cn('text-xs mt-0.5 font-medium', saved ? 'text-green-600' : 'text-indigo-500')}>{item.translation}</p>
      </div>
      <button
        onClick={handleSave}
        disabled={saved || saving}
        title={saved ? 'Saqlangan' : 'Lugatga saqlash'}
        className={cn(
          'shrink-0 p-1.5 rounded-lg transition-all',
          saved
            ? 'text-green-600 bg-green-100 cursor-default'
            : 'text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100',
        )}
      >
        {saved ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function ReadingPage() {
  const [keyword, setKeyword] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('B1');
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  const generate = async (topic: string) => {
    if (!topic.trim()) { toast.error('Mavzu kiriting'); return; }
    setLoading(true);
    setPassage(null);
    setSavedWords(new Set());
    try {
      const result = await readingService.generate(topic.trim(), selectedLevel);
      setPassage(result);
    } catch {
      toast.error('Matn yaratishda xato. Qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWord = async (item: VocabItem) => {
    try {
      const result = await readingService.saveWord(item, passage?.level ?? selectedLevel);
      setSavedWords((prev) => new Set(Array.from(prev).concat(item.word)));
      if (result.alreadyExisted) {
        toast('Bu so\'z lugatda allaqachon bor', { icon: '📚' });
      } else {
        toast.success(`"${item.word}" lugatga saqlandi!`);
      }
    } catch {
      toast.error('Saqlashda xato yuz berdi');
    }
  };

  const handleSearch = () => generate(keyword);
  const handlePreset = (value: string) => { setKeyword(value); generate(value); };

  const src = passage?.source;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="page-container max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookMarked className="w-6 h-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Oqish mashqi</h1>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Mavzu tanlang yoki kalit so'z yozing — AI darajangizga mos matn yaratadi.
          </p>

          {/* Input + level selector */}
          <div className="card mb-4">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Mavzu yoki kalit so'z... (masalan: robots, Shakespeare, climate change)"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                disabled={loading}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !keyword.trim()}
                className="btn-primary flex items-center gap-2 px-5 disabled:opacity-40"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Yaratilmoqda...' : 'Yaratish'}
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
          {!passage && !loading && (
            <div className="mb-6">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Tayyor mavzular</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {PRESET_TOPICS.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => handlePreset(topic.value)}
                    className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-100 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-xs text-gray-600 hover:text-primary-700"
                  >
                    <span className="text-2xl">{topic.emoji}</span>
                    <span className="font-medium text-center leading-tight">{topic.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="card animate-pulse space-y-4">
              <div className="h-6 bg-gray-100 rounded-lg w-2/3" />
              <div className="flex gap-2">
                <div className="h-5 bg-gray-100 rounded-full w-16" />
                <div className="h-5 bg-gray-100 rounded-full w-20" />
                <div className="h-5 bg-gray-100 rounded-full w-24" />
              </div>
              <div className="space-y-2">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className={`h-4 bg-gray-100 rounded ${i === 5 ? 'w-3/4' : 'w-full'}`} />
                ))}
              </div>
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
            </div>
          )}

          {/* Passage */}
          {passage && !loading && (
            <div className="space-y-4">
              {/* Header */}
              <div className="card">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-xl font-bold text-gray-900 leading-snug">{passage.title}</h2>
                  <button
                    onClick={() => setPassage(null)}
                    className="btn-secondary flex items-center gap-1.5 text-sm shrink-0"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Yangi
                  </button>
                </div>

                {/* Meta badges */}
                <div className="flex items-center gap-2 flex-wrap text-xs mb-3">
                  <span className={cn('px-2.5 py-1 rounded-full font-semibold border', LEVEL_COLORS[passage.level])}>
                    {passage.level}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {TYPE_LABELS[passage.type] ?? `📄 ${passage.type}`}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Hash className="w-3 h-3" />
                    {passage.wordCount} so'z
                  </span>
                </div>

                {/* Source */}
                {src && (
                  <div className={cn(
                    'flex items-start gap-2 px-3 py-2 rounded-xl border text-xs',
                    SOURCE_TYPE_LABELS[src.type]?.color ?? 'bg-gray-100 text-gray-600 border-gray-200',
                  )}>
                    <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold">Manba: </span>
                      <span>{src.title}</span>
                      {src.author && <span> · {src.author}</span>}
                      {src.year && <span> · {src.year}</span>}
                      <span className="ml-2 opacity-60">({SOURCE_TYPE_LABELS[src.type]?.label})</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reading content */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-primary-500" />
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Matn</h3>
                </div>
                <div className="text-gray-800 leading-8 text-base">
                  {passage.content.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-4 last:mb-0">{para}</p>
                  ))}
                </div>
              </div>

              {/* Vocabulary */}
              {passage.vocabulary.length > 0 && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Muhim so'zlar</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {passage.vocabulary.length} ta
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    Saqlash tugmasini bosib so'zni lugatga qo'shing
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {passage.vocabulary.map((v, i) => (
                      <VocabCard
                        key={i}
                        item={v}
                        level={passage.level}
                        saved={savedWords.has(v.word)}
                        onSave={() => handleSaveWord(v)}
                      />
                    ))}
                  </div>
                  {savedWords.size > 0 && (
                    <p className="text-xs text-green-600 mt-3 text-center font-medium">
                      {savedWords.size} ta so'z lugatga saqlandi ✓
                    </p>
                  )}
                </div>
              )}

              {/* Comprehension questions */}
              {passage.questions.length > 0 && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Tushunish savollari</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {passage.questions.length} ta
                    </span>
                  </div>
                  <div className="space-y-2">
                    {passage.questions.map((q, i) => (
                      <QuestionCard key={i} q={q.question} a={q.answer} />
                    ))}
                  </div>
                </div>
              )}

              {/* Generate another */}
              <button
                onClick={() => generate(keyword || passage.title)}
                className="btn-secondary flex items-center gap-2 mx-auto"
              >
                <RefreshCcw className="w-4 h-4" />
                Shu mavzuda boshqa matn
              </button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
