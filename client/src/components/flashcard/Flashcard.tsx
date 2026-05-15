'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Word } from '@/types';
import { getLevelColor, cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { useSpeech } from '@/hooks/useSpeech';

interface FlashcardProps {
  word: Word & { planWordId?: string };
  onKnow?: () => Promise<void>;
  onDontKnow?: () => Promise<void>;
  showActions?: boolean;
  disabled?: boolean;
}

export function Flashcard({ word, onKnow, onDontKnow, showActions = true, disabled }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { speak, speaking } = useSpeech();

  const handleFlip = () => {
    if (!processing) setIsFlipped(!isFlipped);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(word.word);
  };

  const handleKnow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (processing || disabled) return;
    setProcessing(true);
    try {
      await onKnow?.();
    } finally {
      setProcessing(false);
      setIsFlipped(false);
    }
  };

  const handleDontKnow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (processing || disabled) return;
    setProcessing(true);
    try {
      await onDontKnow?.();
    } finally {
      setProcessing(false);
      setIsFlipped(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={cn('w-full max-w-md h-64 cursor-pointer', processing && 'opacity-75')}
        onClick={handleFlip}
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="relative w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.45, type: 'spring', damping: 22 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-xs font-semibold px-2 py-1 rounded-full mb-4 bg-white/20 text-white">
              {word.level}
            </span>
            <h2 className="text-4xl font-bold text-white text-center mb-3">{word.word}</h2>
            <button
              onClick={handleSpeak}
              className={cn(
                'flex items-center gap-1.5 text-primary-100 hover:text-white text-sm transition-colors mt-2 px-3 py-1.5 rounded-lg hover:bg-white/10',
                speaking && 'text-white bg-white/10'
              )}
            >
              {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {speaking ? 'Tinglayabdi...' : 'Talaffuzni eshit'}
            </button>
            <p className="text-primary-100 text-xs mt-4">{t.vocabulary.showTranslation}</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-white border-2 border-primary-100 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full mb-3', getLevelColor(word.level))}>
              {word.level}
            </span>
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">{word.translation}</h2>
            <button
              onClick={handleSpeak}
              className={cn(
                'flex items-center gap-1.5 text-gray-400 hover:text-primary-600 text-xs transition-colors px-2 py-1 rounded-lg hover:bg-primary-50',
                speaking && 'text-primary-600 bg-primary-50'
              )}
            >
              <Volume2 className="w-3.5 h-3.5" />
              {word.word}
            </button>
            {word.example && (
              <div className="mt-3 text-center">
                <p className="text-sm text-gray-500 italic">"{word.example}"</p>
                {word.exampleUz && <p className="text-xs text-gray-400 mt-1">"{word.exampleUz}"</p>}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400">
        <RotateCcw className="w-4 h-4" />
        <span>Kartochkani bosib aylantiring</span>
      </div>

      {showActions && isFlipped && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 w-full max-w-md"
          >
            <button
              onClick={handleDontKnow}
              disabled={processing || disabled}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              {t.vocabulary.dontKnow}
            </button>
            <button
              onClick={handleKnow}
              disabled={processing || disabled}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 text-green-600 font-medium hover:bg-green-100 transition-colors border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              {t.vocabulary.iKnow}
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
