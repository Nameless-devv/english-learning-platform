'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen, LayoutDashboard, PenLine, Mic, LogOut,
  Shield, Flame, Star, BookMarked, GraduationCap, Award,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

const userLinks = [
  { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
  { href: '/vocabulary', label: t.nav.vocabulary, icon: BookOpen },
  { href: '/grammar', label: t.nav.grammar, icon: GraduationCap },
  { href: '/writing', label: t.nav.writing, icon: PenLine },
  { href: '/speaking', label: t.nav.speaking, icon: Mic },
  { href: '/reading', label: t.nav.reading, icon: BookMarked },
  { href: '/ielts', label: 'IELTS', icon: Award },
];

const adminLinks = [
  { href: '/admin', label: t.nav.admin, icon: Shield },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const links = user?.role === 'ADMIN' ? [...userLinks, ...adminLinks] : userLinks;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} className="flex items-center gap-2 font-bold text-primary-700 text-xl shrink-0">
            <BookOpen className="w-6 h-6" />
            <span>ELP</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:block">{label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-orange-500 font-medium">
                    <Flame className="w-4 h-4" />
                    {user.streak}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-500 font-medium">
                    <Star className="w-4 h-4" />
                    {user.xp} XP
                  </span>
                </div>
                <span className="text-sm text-gray-700 hidden lg:block">{user.name || user.email}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                  title={t.common.logout}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:block">{t.common.logout}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav — horizontal scroll */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-2 text-xs shrink-0 transition-colors',
                  active ? 'text-primary-600' : 'text-gray-400',
                )}
              >
                <Icon className={cn('w-5 h-5', active && 'scale-110 transition-transform')} />
                <span className={cn('font-medium', active && 'font-semibold')}>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
