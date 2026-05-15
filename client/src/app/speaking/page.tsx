'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic, MicOff, RefreshCcw, CheckCircle, AlertCircle,
  ChevronRight, Volume2, Star, TrendingUp,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { speakingService, SpeakingFeedback } from '@/services/speaking.service';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const TOPICS = [
  { emoji: '👤', label: 'O\'zingiz haqida', prompt: 'Tell me about yourself, your hobbies, and your daily routine.' },
  { emoji: '🏠', label: 'Uyingiz', prompt: 'Describe where you live. What do you like about your neighborhood?' },
  { emoji: '🌍', label: 'Sayohat', prompt: 'Talk about a place you have visited or would like to visit.' },
  { emoji: '📱', label: 'Texnologiya', prompt: 'How does technology affect your daily life?' },
  { emoji: '🍕', label: 'Sevimli taom', prompt: 'Describe your favorite food and why you love it.' },
  { emoji: '🎯', label: 'Maqsadlar', prompt: 'What are your goals for this year? How do you plan to achieve them?' },
  { emoji: '📚', label: 'Ta\'lim', prompt: 'Talk about your education or a subject you enjoy studying.' },
  { emoji: '🤝', label: 'Do\'stlar', prompt: 'Describe a good friend and what makes your friendship special.' },
];

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-gray-100 text-gray-700',
  A2: 'bg-blue-100 text-blue-700',
  B1: 'bg-green-100 text-green-700',
  B2: 'bg-yellow-100 text-yellow-700',
  C1: 'bg-orange-100 text-orange-700',
  C2: 'bg-purple-100 text-purple-700',
};

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#22c55e' : score >= 75 ? '#6366f1' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{score}</span>
        <span className="text-xs text-gray-400">/ 100</span>
      </div>
    </div>
  );
}

export default function SpeakingPage() {
  const [selectedTopic, setSelectedTopic] = useState<typeof TOPICS[0] | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const startRecording = async () => {
    try {
      setError('');
      setFeedback(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size < 1000) {
          setError('Ovoz juda qisqa. Kamida 2-3 soniya gapiring.');
          return;
        }
        setIsAnalyzing(true);
        try {
          const result = await speakingService.transcribe(blob);
          setFeedback(result);
        } catch {
          toast.error('Tahlil amalga oshmadi. Qayta urinib ko\'ring.');
        } finally {
          setIsAnalyzing(false);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError('Mikrofonga ruxsat berilmadi');
    }
  };

  const stopRecording = () => {
    stopTimer();
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const reset = () => {
    setFeedback(null);
    setError('');
    setSeconds(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="page-container max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gapirish mashqi</h1>
          <p className="text-gray-500 text-sm mb-6">
            Mavzu tanlang, ingliz tilida gapiring — AI talaffuz, grammatika va lug'atni baholaydi.
          </p>

          {/* Topic picker */}
          {!feedback && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {TOPICS.map((topic) => (
                <button
                  key={topic.label}
                  onClick={() => { setSelectedTopic(topic); reset(); }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all',
                    selectedTopic?.label === topic.label
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-gray-50',
                  )}
                >
                  <span className="text-2xl">{topic.emoji}</span>
                  <span className="text-xs text-center leading-tight">{topic.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Prompt card */}
          {selectedTopic && !feedback && (
            <div className="bg-white border border-primary-100 rounded-xl p-4 mb-6">
              <p className="text-xs text-primary-500 font-semibold uppercase tracking-wider mb-1">Mavzu</p>
              <p className="text-gray-800 font-medium">{selectedTopic.prompt}</p>
            </div>
          )}

          {/* Recorder */}
          {!feedback && (
            <div className="card text-center py-10">
              {isAnalyzing ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 text-sm">AI tahlil qilmoqda...</p>
                </div>
              ) : (
                <>
                  <div className={cn(
                    'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all',
                    isRecording ? 'bg-red-100 animate-pulse shadow-lg shadow-red-200' : 'bg-primary-50',
                  )}>
                    {isRecording
                      ? <MicOff className="w-10 h-10 text-red-500" />
                      : <Mic className="w-10 h-10 text-primary-600" />}
                  </div>

                  {isRecording && (
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      <span className="text-red-500 font-mono font-semibold">{formatTime(seconds)}</span>
                    </div>
                  )}

                  <p className="text-gray-500 text-sm mb-5">
                    {isRecording
                      ? 'Gapiring... Tugagach to\'xtating'
                      : selectedTopic
                      ? 'Tayyorsiz? Yozni bosing va inglizcha gapiring'
                      : 'Avval mavzu tanlang'}
                  </p>

                  {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!selectedTopic && !isRecording}
                    className={cn(
                      'px-8 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-40',
                      isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-600 hover:bg-primary-700',
                    )}
                  >
                    {isRecording ? 'To\'xtatish' : 'Gapirish boshlash'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className="space-y-4">
              {/* Score + level header */}
              <div className="card flex items-center gap-6">
                <ScoreRing score={feedback.score} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-gray-900">Natija</h2>
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      LEVEL_COLORS[feedback.detectedLevel] ?? 'bg-gray-100 text-gray-700',
                    )}>
                      {feedback.detectedLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {feedback.score >= 90 ? 'Ajoyib! Deyarli mukammal.' :
                     feedback.score >= 75 ? 'Yaxshi! Bir oz yaxshilash kerak.' :
                     feedback.score >= 60 ? "O'rtacha. Ko'proq mashq qiling." :
                     "Mashq kerak. Davom eting!"}
                  </p>
                </div>
              </div>

              {/* Transcript */}
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Siz aytgan gap</h3>
                <p className="text-gray-800 leading-relaxed">"{feedback.transcript}"</p>
              </div>

              {/* Better way */}
              {feedback.betterWayToSay && feedback.betterWayToSay !== feedback.transcript && (
                <div className="card bg-primary-50 border-primary-100">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-primary-700 mb-1">Yaxshiroq aytish mumkin</h3>
                      <p className="text-primary-800 font-medium italic">"{feedback.betterWayToSay}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed feedback */}
              <div className="card space-y-4">
                <h3 className="font-semibold text-gray-900">Batafsil baholash</h3>
                {[
                  { label: 'Talaffuz', value: feedback.pronunciation },
                  { label: 'Grammatika', value: feedback.grammar },
                  { label: "So'z boyligi", value: feedback.vocabulary },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-gray-700 text-sm">{value}</p>
                  </div>
                ))}
              </div>

              {/* Strengths & improvements */}
              <div className="grid sm:grid-cols-2 gap-4">
                {(feedback.strengths ?? []).length > 0 && (
                  <div className="card">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold text-green-700 mb-3">
                      <CheckCircle className="w-4 h-4" /> Kuchli tomonlar
                    </h3>
                    <ul className="space-y-2">
                      {(feedback.strengths ?? []).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <Star className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(feedback.improvements ?? []).length > 0 && (
                  <div className="card">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold text-orange-700 mb-3">
                      <AlertCircle className="w-4 h-4" /> Yaxshilash kerak
                    </h3>
                    <ul className="space-y-2">
                      {(feedback.improvements ?? []).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <ChevronRight className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Try again */}
              <button
                onClick={reset}
                className="btn-secondary flex items-center gap-2 mx-auto"
              >
                <RefreshCcw className="w-4 h-4" />
                Qaytadan urinish
              </button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
