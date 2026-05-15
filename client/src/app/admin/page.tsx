'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users, BookOpen, PenLine, Activity, Plus, Trash2, Edit2,
  X, Check, Shield, UserCog, Eye, EyeOff, Sparkles, Volume2,
  Clock, Flame, Star, ChevronDown, ChevronUp, Search,
  TrendingUp, Calendar, Award, BarChart2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { adminService } from '@/services/admin.service';
import { learningService } from '@/services/learning.service';
import { useSpeech } from '@/hooks/useSpeech';
import { AdminStats, Word, WordLevel } from '@/types';
import { t } from '@/lib/i18n';
import { getLevelColor, cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

type Tab = 'stats' | 'users' | 'words';
const LEVELS: WordLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const emptyWord = { word: '', translation: '', example: '', exampleUz: '', level: 'A1' as WordLevel };

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} daq`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} soat ${m} daq` : `${h} soat`;
}

function timeAgo(date: string | null) {
  if (!date) return 'Hech qachon';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hozir';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} soat oldin`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} kun oldin`;
  return formatDate(date);
}

// ── User card (mobile-friendly) ───────────────────────────────────────────────
function UserCard({
  user,
  onChangeRole,
  onDelete,
}: {
  user: any;
  onChangeRole: (id: string, role: string) => void;
  onDelete: (id: string, email: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const activityScore = Math.min(100, Math.round(
    (user.learnedWords / 10) * 30 +
    (user._count.writings / 5) * 20 +
    (user.streak / 7) * 30 +
    (user.totalMinutes / 60) * 20
  ));

  return (
    <div className={cn(
      'bg-white rounded-2xl border transition-all overflow-hidden',
      expanded ? 'border-primary-200 shadow-md' : 'border-gray-100 shadow-sm',
    )}>
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        {/* Avatar */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
          user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-700',
        )}>
          {(user.name || user.email)[0].toUpperCase()}
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 truncate text-sm">
              {user.name || user.email.split('@')[0]}
            </p>
            {user.role === 'ADMIN' && (
              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">Admin</span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>

        {/* Quick stats */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 shrink-0">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            {formatMinutes(user.totalMinutes || 0)}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-green-400" />
            {user.learnedWords}
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            {user.streak}
          </span>
        </div>

        {/* Last active (desktop) */}
        <span className="hidden lg:block text-xs text-gray-400 shrink-0 w-28 text-right">
          {timeAgo(user.lastActiveAt)}
        </span>

        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 mb-4">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-800">{formatMinutes(user.totalMinutes || 0)}</p>
              <p className="text-xs text-blue-500">Jami vaqt</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <BookOpen className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-800">{user.learnedWords}</p>
              <p className="text-xs text-green-500">So'z yodlagan</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-orange-800">{user.streak}</p>
              <p className="text-xs text-orange-500">Ketma-ket kun</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <Star className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-800">{user.xp}</p>
              <p className="text-xs text-yellow-500">XP</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <PenLine className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-purple-800">{user._count.writings}</p>
              <p className="text-xs text-purple-500">Yozish</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <Calendar className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-indigo-800">{user._count.dailyPlans}</p>
              <p className="text-xs text-indigo-500">Faol kun</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <TrendingUp className="w-4 h-4 text-gray-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-800">{activityScore}</p>
              <p className="text-xs text-gray-500">Faollik ball</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-3 text-center">
              <Activity className="w-4 h-4 text-pink-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-pink-800 leading-tight">{timeAgo(user.lastActiveAt)}</p>
              <p className="text-xs text-pink-500">So'nggi faollik</p>
            </div>
          </div>

          {/* Activity bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Faollik darajasi</span>
              <span className="font-semibold text-gray-700">{activityScore}/100</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  activityScore >= 70 ? 'bg-green-500' :
                  activityScore >= 40 ? 'bg-yellow-500' : 'bg-red-400',
                )}
                style={{ width: `${activityScore}%` }}
              />
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
            <span>Qo'shilgan: {formatDate(user.createdAt)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onChangeRole(user.id, user.role)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium transition-colors"
            >
              <UserCog className="w-4 h-4" />
              {user.role === 'ADMIN' ? 'USER ga o\'zgartir' : 'ADMIN qil'}
            </button>
            <button
              onClick={() => onDelete(user.id, user.email)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              O'chirish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main admin page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userSort, setUserSort] = useState<'time' | 'words' | 'xp' | 'streak' | 'recent'>('recent');
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const { speak } = useSpeech();

  const [showWordForm, setShowWordForm] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [wordForm, setWordForm] = useState(emptyWord);

  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', password: '', name: '' });
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [genForm, setGenForm] = useState({ topic: '', count: 10 });
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<{ added: number; skipped: number; words: Word[] } | null>(null);

  useEffect(() => { loadData(); }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === 'stats') setStats(await adminService.getStats());
      else if (tab === 'users') setUsers((await adminService.getUsers()).users);
      else if (tab === 'words') setWords(await learningService.getAllWords());
    } catch { toast.error('Ma\'lumot yuklanmadi'); }
    finally { setLoading(false); }
  }

  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      list = list.filter((u) => u.email.toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (userSort === 'time') return (b.totalMinutes || 0) - (a.totalMinutes || 0);
      if (userSort === 'words') return (b.learnedWords || 0) - (a.learnedWords || 0);
      if (userSort === 'xp') return (b.xp || 0) - (a.xp || 0);
      if (userSort === 'streak') return (b.streak || 0) - (a.streak || 0);
      // recent
      return new Date(b.lastActiveAt ?? 0).getTime() - new Date(a.lastActiveAt ?? 0).getTime();
    });
    return list;
  }, [users, userSearch, userSort]);

  const totalTime = useMemo(() => users.reduce((s, u) => s + (u.totalMinutes || 0), 0), [users]);

  const handleCreateAdmin = async () => {
    if (!adminForm.email || !adminForm.password) return toast.error('Email va parol kiritilishi shart');
    if (adminForm.password.length < 8) return toast.error("Parol kamida 8 ta belgi bo'lishi kerak");
    setAdminLoading(true);
    try {
      const u = await adminService.createAdmin(adminForm.email, adminForm.password, adminForm.name || undefined);
      toast.success(`Admin yaratildi: ${u.email}`);
      setShowAdminForm(false);
      setAdminForm({ email: '', password: '', name: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    } finally { setAdminLoading(false); }
  };

  const handleGenerateWords = async () => {
    if (!genForm.topic.trim()) return toast.error('Mavzu kiriting');
    setGenLoading(true); setGenResult(null);
    try {
      const result = await adminService.generateWords(genForm.topic.trim(), genForm.count);
      setGenResult(result);
      toast.success(`${result.added} ta so'z qo'shildi!`);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI xato yuz berdi');
    } finally { setGenLoading(false); }
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Bu foydalanuvchini ${newRole} ga o'zgartirmoqchimisiz?`)) return;
    try {
      await adminService.changeUserRole(userId, newRole as any);
      toast.success(`Rol ${newRole} ga o'zgartirildi`);
      loadData();
    } catch { toast.error('Xato yuz berdi'); }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`"${email}" ni o'chirasizmi?`)) return;
    try {
      await adminService.deleteUser(userId);
      toast.success("Foydalanuvchi o'chirildi");
      loadData();
    } catch { toast.error('Xato yuz berdi'); }
  };

  const handleWordSubmit = async () => {
    if (!wordForm.word || !wordForm.translation) return toast.error("So'z va tarjima kiritilishi shart");
    try {
      if (editingWord) {
        await adminService.updateWord(editingWord.id, wordForm);
        toast.success(t.admin.wordUpdated);
      } else {
        await adminService.createWord(wordForm);
        toast.success(t.admin.wordAdded);
      }
      setShowWordForm(false); setEditingWord(null); setWordForm(emptyWord);
      loadData();
    } catch { toast.error('Xato yuz berdi'); }
  };

  const handleDeleteWord = async (id: string) => {
    if (!confirm(t.admin.confirmDelete)) return;
    try {
      await adminService.deleteWord(id);
      toast.success(t.admin.wordDeleted);
      loadData();
    } catch { toast.error('Xato yuz berdi'); }
  };

  const startEditWord = (word: Word) => {
    setEditingWord(word);
    setWordForm({ word: word.word, translation: word.translation, example: word.example || '', exampleUz: word.exampleUz || '', level: word.level });
    setShowWordForm(true);
  };

  const statCards = [
    { label: t.admin.totalUsers, value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: t.admin.totalWords, value: stats?.totalWords || 0, icon: BookOpen, color: 'text-green-600 bg-green-50' },
    { label: t.admin.totalWritings, value: stats?.totalWritings || 0, icon: PenLine, color: 'text-purple-600 bg-purple-50' },
    { label: t.admin.activeToday, value: stats?.activeToday || 0, icon: Activity, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">{t.admin.title}</h1>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-100 w-fit">
            {([['stats', t.admin.stats], ['users', t.admin.users], ['words', t.admin.words]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={cn('px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors',
                  tab === id ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50')}>
                {label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* ─── Statistika ─── */}
          {!loading && tab === 'stats' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {statCards.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">{label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── Foydalanuvchilar ─── */}
          {!loading && tab === 'users' && (
            <div>
              {/* Top bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Ism yoki email qidirish..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>

                {/* Sort */}
                <div className="flex gap-1 flex-wrap">
                  {([
                    ['recent', 'Oxirgi'],
                    ['time', '⏱ Vaqt'],
                    ['words', '📚 So\'z'],
                    ['xp', '⭐ XP'],
                    ['streak', '🔥 Streak'],
                  ] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setUserSort(val)}
                      className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        userSort === val ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300')}>
                      {label}
                    </button>
                  ))}
                </div>

                <button onClick={() => setShowAdminForm(true)} className="btn-primary flex items-center gap-2 text-sm shrink-0">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Yangi Admin</span>
                  <span className="sm:hidden">+Admin</span>
                </button>
              </div>

              {/* Summary bar */}
              <div className="flex flex-wrap gap-3 mb-4 p-3 bg-white rounded-xl border border-gray-100 text-xs text-gray-600">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-400" /><strong>{filteredUsers.length}</strong> foydalanuvchi</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400" />Jami: <strong>{formatMinutes(totalTime)}</strong></span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-green-400" />Jami yodlagan: <strong>{users.reduce((s, u) => s + (u.learnedWords || 0), 0)}</strong> so'z</span>
                <span className="flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5 text-purple-400" />O'rtacha vaqt: <strong>{users.length ? formatMinutes(Math.round(totalTime / users.length)) : '0'}</strong></span>
              </div>

              {/* User cards */}
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <UserCard key={u.id} user={u} onChangeRole={handleChangeRole} onDelete={handleDeleteUser} />
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">Foydalanuvchi topilmadi</div>
                )}
              </div>

              {/* Admin create modal */}
              {showAdminForm && (
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold text-gray-900">Yangi Admin yaratish</h3>
                      <button onClick={() => setShowAdminForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Ism</label>
                        <input value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} className="input-field text-sm" placeholder="Admin ismi" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
                        <input value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} type="email" className="input-field text-sm" placeholder="admin@example.com" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Parol *</label>
                        <div className="relative">
                          <input value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} type={showAdminPass ? 'text' : 'password'} className="input-field text-sm pr-10" placeholder="Kamida 8 ta belgi" />
                          <button type="button" onClick={() => setShowAdminPass(!showAdminPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setShowAdminForm(false)} className="btn-secondary flex-1">Bekor</button>
                      <button onClick={handleCreateAdmin} disabled={adminLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                        {adminLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Shield className="w-4 h-4" />}
                        {adminLoading ? 'Yaratilmoqda...' : 'Yaratish'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── So'zlar ─── */}
          {!loading && tab === 'words' && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* AI Generate */}
                <div className="flex-1 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">AI bilan so'z yaratish</h3>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={genForm.topic}
                      onChange={e => setGenForm({ ...genForm, topic: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && !genLoading && handleGenerateWords()}
                      className="flex-1 border border-violet-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 bg-white"
                      placeholder="Mavzu: food, travel..."
                      disabled={genLoading}
                    />
                    <select
                      value={genForm.count}
                      onChange={e => setGenForm({ ...genForm, count: +e.target.value })}
                      className="border border-violet-200 rounded-xl px-2 py-2 text-sm bg-white focus:outline-none"
                      disabled={genLoading}
                    >
                      {[5, 10, 15, 20, 30, 50].map(n => <option key={n} value={n}>{n} ta</option>)}
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateWords}
                    disabled={genLoading || !genForm.topic.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {genLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Yaratilmoqda...</> : <><Sparkles className="w-4 h-4" />Yaratish</>}
                  </button>
                  {genResult && (
                    <p className="mt-2 text-xs text-green-700 font-medium">✅ {genResult.added} ta qo'shildi, {genResult.skipped} ta o'tkazildi</p>
                  )}
                </div>

                <button
                  onClick={() => { setEditingWord(null); setWordForm(emptyWord); setShowWordForm(true); }}
                  className="btn-primary flex items-center justify-center gap-2 text-sm sm:self-start"
                >
                  <Plus className="w-4 h-4" /> {t.admin.addWord}
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-3">{words.length} ta so'z</p>

              {showWordForm && (
                <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold text-gray-900">{editingWord ? t.admin.editWord : t.admin.addWord}</h3>
                      <button onClick={() => setShowWordForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">So'z *</label>
                          <input value={wordForm.word} onChange={e => setWordForm({ ...wordForm, word: e.target.value })} className="input-field text-sm" placeholder="apple" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Tarjima *</label>
                          <input value={wordForm.translation} onChange={e => setWordForm({ ...wordForm, translation: e.target.value })} className="input-field text-sm" placeholder="olma" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Daraja</label>
                        <select value={wordForm.level} onChange={e => setWordForm({ ...wordForm, level: e.target.value as WordLevel })} className="input-field text-sm">
                          {LEVELS.map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Misol (inglizcha)</label>
                        <input value={wordForm.example} onChange={e => setWordForm({ ...wordForm, example: e.target.value })} className="input-field text-sm" placeholder="I eat an apple." />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Misol (o'zbekcha)</label>
                        <input value={wordForm.exampleUz} onChange={e => setWordForm({ ...wordForm, exampleUz: e.target.value })} className="input-field text-sm" placeholder="Men olma yeyman." />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={() => setShowWordForm(false)} className="btn-secondary flex-1">Bekor</button>
                      <button onClick={handleWordSubmit} className="btn-primary flex-1 flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> {editingWord ? 'Saqlash' : "Qo'shish"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {words.map((word) => (
                  <div key={word.id} className="bg-white rounded-xl border border-gray-100 p-3 group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-gray-900 text-sm">{word.word}</h3>
                          <button onClick={() => speak(word.word)} className="p-1 rounded text-gray-300 hover:text-primary-600 transition-colors opacity-0 group-hover:opacity-100">
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-primary-600 text-xs">{word.translation}</p>
                      </div>
                      <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-full ml-2 shrink-0', getLevelColor(word.level))}>{word.level}</span>
                    </div>
                    {word.example && <p className="text-xs text-gray-400 italic mb-2 line-clamp-1">"{word.example}"</p>}
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditWord(word)} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600">
                        <Edit2 className="w-3 h-3" /> Tahrirlash
                      </button>
                      <button onClick={() => handleDeleteWord(word.id)} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600">
                        <Trash2 className="w-3 h-3" /> O'chirish
                      </button>
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
