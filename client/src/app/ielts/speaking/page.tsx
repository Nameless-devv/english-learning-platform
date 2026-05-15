'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Mic, MicOff, Square, ChevronDown, ChevronUp, Lightbulb, Play } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ieltsService, SpeakingBandResult, SpeakingPrompt } from '@/services/ielts.service';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

function BandRing({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 64 : 96;
  const r = size === 'sm' ? 26 : 38;
  const circ = 2 * Math.PI * r;
  const pct = (score / 9) * 100;
  const color = score >= 7 ? '#22c55e' : score >= 5.5 ? '#f97316' : score >= 4 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative" style={{ width: dim, height: dim }}>
      <svg className="-rotate-90" width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold text-gray-900', size === 'sm' ? 'text-sm' : 'text-2xl')}>{score}</span>
      </div>
    </div>
  );
}

function CriterionRow({ label, score, desc }: { label: string; score: number; desc: string }) {
  const [open, setOpen] = useState(false);
  const pct = (score / 9) * 100;
  const color = score >= 7 ? 'bg-green-500' : score >= 5.5 ? 'bg-orange-500' : 'bg-yellow-500';
  return (
    <div className="border border-gray-100 rounded-xl p-3">
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-xs font-medium text-gray-600 flex-1">{label}</span>
        <span className="text-sm font-bold w-8 text-right">{score}</span>
        <button onClick={() => setOpen(!open)} className="text-gray-400">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      {open && <p className="text-xs text-gray-600 mt-2 leading-relaxed">{desc}</p>}
    </div>
  );
}

export default function IeltsSpeakingPage() {
  const [part, setPart] = useState<1 | 2 | 3>(1);
  const [promptData, setPromptData] = useState<SpeakingPrompt | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SpeakingBandResult | null>(null);
  const [prepTimer, setPrepTimer] = useState<number | null>(null); // Part 2 prep countdown

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prepRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    ieltsService.getSpeakingPrompt(part).then(setPromptData).catch(() => {});
    setResult(null);
    setRecording(false);
    setPrepTimer(null);
    setSeconds(0);
  }, [part]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (prepRef.current) clearInterval(prepRef.current);
  }, []);

  const startPrep = () => {
    let t = 60;
    setPrepTimer(t);
    prepRef.current = setInterval(() => {
      t--;
      setPrepTimer(t);
      if (t <= 0) { clearInterval(prepRef.current!); setPrepTimer(null); }
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(250);
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error('Mikrofon ruxsati kerak');
    }
  };

  const stopRecording = () => {
    if (!mediaRef.current) return;
    mediaRef.current.stop();
    mediaRef.current.stream.getTracks().forEach((t) => t.stop());
    clearInterval(timerRef.current!);
    setRecording(false);

    setTimeout(async () => {
      const blob = new Blob(chunksRef.current, { type: mediaRef.current?.mimeType ?? 'audio/webm' });
      if (blob.size < 1000) { toast.error('Juda qisqa yozuv'); return; }

      const promptText = buildPromptText();
      setAnalyzing(true);
      try {
        const res = await ieltsService.analyzeSpeaking(blob, part, promptText);
        setResult(res);
      } catch {
        toast.error('Baholashda xato');
      } finally {
        setAnalyzing(false);
      }
    }, 300);
  };

  const buildPromptText = () => {
    if (!promptData) return '';
    if (promptData.questions) return promptData.questions.join('\n');
    if (promptData.cueCard) return promptData.cueCard;
    return '';
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="page-container max-w-2xl mx-auto">

          <div className="flex items-center gap-3 mb-6">
            <Link href="/ielts" className="text-gray-400 hover:text-gray-600"><ChevronLeft className="w-5 h-5" /></Link>
            <Mic className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">IELTS Speaking</h1>
          </div>

          {/* Part tabs */}
          <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-100 w-fit">
            {([1, 2, 3] as const).map((p) => (
              <button key={p} onClick={() => setPart(p)}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  part === p ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                )}>
                Part {p}
              </button>
            ))}
          </div>

          {promptData && !result && (
            <div className="space-y-4">
              {/* Prompt card */}
              <div className="card">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <Mic className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{promptData.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{promptData.instructions}</p>
                  </div>
                </div>

                {/* Part 1/3: Questions list */}
                {promptData.questions && (
                  <div className="space-y-2 mt-3">
                    {promptData.questions.map((q, i) => (
                      <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                        <span className="font-semibold text-orange-500 shrink-0">{i + 1}.</span>
                        {q}
                      </div>
                    ))}
                  </div>
                )}

                {/* Part 2: Cue card */}
                {promptData.cueCard && (
                  <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wider">Cue Card</p>
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{promptData.cueCard}</p>
                    {promptData.followUp && (
                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <p className="text-xs text-amber-600 font-medium">Follow-up:</p>
                        <p className="text-sm text-gray-700 mt-1">{promptData.followUp}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Part 2 prep timer */}
                {part === 2 && !recording && !analyzing && (
                  <div className="mt-4 flex items-center gap-3">
                    {prepTimer !== null ? (
                      <div className="flex-1 flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="text-2xl font-bold text-yellow-700 w-12 text-center">{prepTimer}s</div>
                        <div className="flex-1 h-2 bg-yellow-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full transition-all"
                            style={{ width: `${(prepTimer / 60) * 100}%` }} />
                        </div>
                        <span className="text-xs text-yellow-600">Tayyorlanmoqda</span>
                      </div>
                    ) : (
                      <button onClick={startPrep}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl text-sm font-medium hover:bg-yellow-100">
                        <Play className="w-4 h-4" /> 1 daqiqa tayyorlanish
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Recording controls */}
              <div className="card text-center py-6">
                {!recording && !analyzing && (
                  <button onClick={startRecording}
                    className="w-20 h-20 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg hover:shadow-xl transition-all">
                    <Mic className="w-8 h-8" />
                  </button>
                )}

                {recording && (
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <MicOff className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-mono font-bold text-gray-800">{fmt(seconds)}</p>
                    <button onClick={stopRecording}
                      className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl mx-auto font-medium">
                      <Square className="w-4 h-4" /> To'xtatish va baholash
                    </button>
                  </div>
                )}

                {analyzing && (
                  <div className="space-y-3">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm">Nutq baholanmoqda...</p>
                  </div>
                )}

                {!recording && !analyzing && (
                  <p className="text-sm text-gray-400 mt-3">Mikrofon tugmasini bosib gapira boshlang</p>
                )}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              <div className="card flex flex-col sm:flex-row items-center gap-6">
                <BandRing score={result.overallBand} />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-lg font-bold text-gray-900">Band {result.overallBand}</h2>
                  <p className="text-sm text-gray-600 mt-1">{result.feedback.overall}</p>
                </div>
              </div>

              {/* Transcript */}
              {result.transcript && (
                <div className="card">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sizning javobingiz</p>
                  <p className="text-sm text-gray-700 leading-relaxed italic">"{result.transcript}"</p>
                </div>
              )}

              {/* Criteria */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Mezonlar</h3>
                <div className="space-y-2">
                  <CriterionRow label="Fluency & Coherence" score={result.fluencyCoherence} desc={result.feedback.fluencyCoherence} />
                  <CriterionRow label="Lexical Resource" score={result.lexicalResource} desc={result.feedback.lexicalResource} />
                  <CriterionRow label="Grammatical Range" score={result.grammaticalRange} desc={result.feedback.grammaticalRange} />
                  <CriterionRow label="Pronunciation" score={result.pronunciation} desc={result.feedback.pronunciation} />
                </div>
              </div>

              {/* Strong points / improvements */}
              <div className="grid sm:grid-cols-2 gap-4">
                {result.feedback.strongPoints?.length > 0 && (
                  <div className="card bg-green-50 border-green-100">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">✅ Kuchli tomonlar</h4>
                    <ul className="space-y-1">
                      {result.feedback.strongPoints.map((s, i) => (
                        <li key={i} className="text-xs text-green-700">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.feedback.improvements?.length > 0 && (
                  <div className="card bg-orange-50 border-orange-100">
                    <h4 className="text-sm font-semibold text-orange-800 mb-2">📈 Yaxshilash kerak</h4>
                    <ul className="space-y-1">
                      {result.feedback.improvements.map((s, i) => (
                        <li key={i} className="text-xs text-orange-700">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Model answer */}
              {result.feedback.modelAnswer && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <h4 className="text-sm font-semibold text-gray-900">Band 8 namuna javob</h4>
                  </div>
                  <p className="text-sm text-gray-700 italic leading-relaxed bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                    "{result.feedback.modelAnswer}"
                  </p>
                </div>
              )}

              <button onClick={() => setResult(null)} className="w-full btn-primary">
                Qayta mashq qilish
              </button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
