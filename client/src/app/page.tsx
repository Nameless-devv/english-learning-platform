import Link from 'next/link';
import { BookOpen, Brain, PenLine, Zap, Star, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Spaced Repetition',
    desc: "Ilmiy asosda qurilgan takrorlash tizimi soʻzlarni uzoq muddatli xotiraga kiritadi",
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: PenLine,
    title: 'AI Yozish Tekshiruvi',
    desc: 'Sun\'iy intellekt yozuvlaringizni tekshirib, xatolarni oʻzbek tilida tushuntiradi',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Zap,
    title: 'Kunlik Reja',
    desc: "Har kuni 10 yangi soʻz, 10 ta takrorlash va 1 ta yozish vazifasi",
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: Star,
    title: 'Gamifikatsiya',
    desc: "XP ballari, streak tizimi va mukofotlar orqali motivatsiyangizni ushlab turing",
    color: 'bg-green-50 text-green-600',
  },
];

const steps = [
  { num: '01', title: "Ro'yxatdan o'ting", desc: 'Tezda hisob yarating' },
  { num: '02', title: 'Kunlik rejani bajarish', desc: "Har kuni yangi so'zlar o'rganing" },
  { num: '03', title: "Yozing va tekshiring", desc: "AI bilan yozishni mashq qiling" },
  { num: '04', title: 'Natijalarni kuzating', desc: 'Progressingizni real vaqtda kuzating' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-primary-700 text-xl">
            <BookOpen className="w-6 h-6" />
            <span>ELP</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Kirish
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm">
              Boshlash
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          <Zap className="w-4 h-4" />
          AI bilan ingliz tilini oʻrganing
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Ingliz tilini{' '}
          <span className="text-primary-600">samarali</span>
          {' '}oʻrganing
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Kunlik rejalar, kartochkalar, AI yozish tekshiruvi va streak tizimi bilan ingliz tilingizni tezda rivojlantiring.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register" className="btn-primary text-base px-8 py-4 text-lg">
            Bepul boshlash →
          </Link>
          <Link href="/auth/login" className="btn-secondary text-base px-8 py-4 text-lg">
            Kirish
          </Link>
        </div>
        <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-500">
          {['Bepul boshlash', 'AI asosli', 'Oʻzbek tilida'].map((item) => (
            <span key={item} className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Nima uchun ELP?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Qanday ishlaydi?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ num, title, desc }) => (
            <div key={num} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                {num}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Bugun boshlang!
          </h2>
          <p className="text-primary-100 mb-8">
            Har kuni 15 daqiqa sarflang va 3 oy ichida ingliz tilingiz sezilarli rivojlansin.
          </p>
          <Link href="/auth/register" className="bg-white text-primary-700 font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors inline-block">
            Hoziroq roʻyxatdan oʻting →
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-100">
        © 2024 English Learning Platform. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
