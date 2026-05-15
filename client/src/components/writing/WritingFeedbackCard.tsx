'use client';

import { CheckCircle, XCircle, Lightbulb, FileText, TrendingUp } from 'lucide-react';
import { WritingFeedback } from '@/types';
import { getScoreColor, cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { motion } from 'framer-motion';

interface Props {
  feedback: WritingFeedback;
}

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-gray-100 text-gray-600',
  A2: 'bg-blue-100 text-blue-700',
  B1: 'bg-green-100 text-green-700',
  B2: 'bg-yellow-100 text-yellow-700',
  C1: 'bg-orange-100 text-orange-700',
  C2: 'bg-purple-100 text-purple-700',
};

export function WritingFeedbackCard({ feedback }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Score + Level */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">{t.writing.score}</h3>
            {feedback.detectedLevel && (
              <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', LEVEL_COLORS[feedback.detectedLevel] ?? 'bg-gray-100 text-gray-600')}>
                {feedback.detectedLevel} darajasi
              </span>
            )}
          </div>
          <span className={cn('text-3xl font-bold', getScoreColor(feedback.score))}>
            {feedback.score}/100
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700',
              feedback.score >= 80 ? 'bg-green-500' :
              feedback.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${feedback.score}%` }}
          />
        </div>
      </div>

      {/* Corrected Text */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">{t.writing.correctedText}</h3>
        </div>
        <p className="text-gray-700 bg-green-50 p-4 rounded-xl leading-relaxed">
          {feedback.correctedText}
        </p>
      </div>

      {/* Mistakes */}
      {feedback.mistakes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-gray-900">{t.writing.mistakes}</h3>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              {feedback.mistakes.length}
            </span>
          </div>
          <div className="space-y-3">
            {feedback.mistakes.map((mistake, i) => (
              <div key={i} className="p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-red-600 line-through bg-red-100 px-2 py-0.5 rounded">
                    {mistake.original}
                  </span>
                  <span className="text-gray-400 font-bold">→</span>
                  <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                    {mistake.correction}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{mistake.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level-Up Examples */}
      {feedback.levelUpExamples?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Darajangizni oshiring</h3>
          </div>
          <div className="space-y-4">
            {feedback.levelUpExamples.map((ex, i) => (
              <div key={i} className="rounded-xl border border-primary-100 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm text-gray-500 italic">"{ex.original}"</p>
                </div>
                <div className="bg-primary-50 px-4 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-primary-800">"{ex.improved}"</p>
                    {ex.targetLevel && (
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full shrink-0', LEVEL_COLORS[ex.targetLevel] ?? 'bg-primary-100 text-primary-700')}>
                        {ex.targetLevel}
                      </span>
                    )}
                  </div>
                  {ex.tip && <p className="text-xs text-primary-600 mt-1">{ex.tip}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Feedback */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-gray-900">{t.writing.overallFeedback}</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">{feedback.overallFeedback}</p>
      </div>

      {/* Suggestions */}
      {feedback.suggestions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">{t.writing.suggestions}</h3>
          </div>
          <ul className="space-y-2">
            {feedback.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-yellow-500 mt-0.5 font-bold">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
