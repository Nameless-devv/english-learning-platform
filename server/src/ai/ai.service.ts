import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { getFallbackWords } from './word-fallback';

export interface WritingFeedback {
  correctedText: string;
  score: number;
  detectedLevel: string;
  mistakes: Array<{
    original: string;
    correction: string;
    explanation: string;
  }>;
  overallFeedback: string;
  levelUpExamples: Array<{
    original: string;
    improved: string;
    targetLevel: string;
    tip: string;
  }>;
  suggestions: string[];
}

export interface GeneratedWord {
  word: string;
  translation: string;
  example: string;
  exampleUz: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private groq: Groq;

  constructor(private config: ConfigService) {
    this.groq = new Groq({ apiKey: config.get('GROQ_API_KEY') ?? '' });
  }

  private async complete(prompt: string, fast = false): Promise<string> {
    const res = await this.groq.chat.completions.create({
      model: fast ? 'llama-3.1-8b-instant' : 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });
    return res.choices[0]?.message?.content ?? '';
  }

  async checkWriting(text: string): Promise<WritingFeedback> {
    const prompt = `You are an expert English language teacher and CEFR level assessor. Analyze the following English text carefully.

TASK 1 — ERROR CHECKING (strict rules):
- Find ONLY definite grammar, spelling, or punctuation errors
- "mistakes[].original" MUST contain the exact wrong word/phrase from the text (never empty)
- "mistakes[].correction" MUST contain the correct English replacement
- Do NOT flag correct English phrases, idioms, or vocabulary as errors
- Do NOT flag proper nouns (names, brands, places) as errors
- If no real errors exist, return empty array for mistakes

TASK 2 — LEVEL DETECTION:
- Analyze vocabulary complexity, grammar structures, sentence variety
- Assign CEFR level: A1, A2, B1, B2, C1, or C2

TASK 3 — LEVEL-UP EXAMPLES (most important):
- Pick 2-3 actual sentences FROM THE TEXT that the user wrote
- Rewrite each one at the NEXT CEFR level up using richer vocabulary and grammar
- These must be REAL rewrites of sentences actually in the text — not invented
- "tip" field: explain in Uzbek why the improved version is better

SCORING: 95-100=perfect, 85-94=minor issues, 70-84=some errors, below 70=many errors

ALL feedback text (overallFeedback, suggestions, tip) must be in UZBEK language.
"correctedText" must always be in ENGLISH.

English text to analyze:
"${text}"

Return ONLY this JSON (no markdown):
{
  "correctedText": "English text with errors fixed",
  "score": 85,
  "detectedLevel": "B1",
  "mistakes": [
    {
      "original": "exact wrong word from text",
      "correction": "correct English word",
      "explanation": "o'zbek tilida xato sababi"
    }
  ],
  "overallFeedback": "o'zbek tilida umumiy baho",
  "levelUpExamples": [
    {
      "original": "foydalanuvchi yozgan gap aynan",
      "improved": "same idea but at higher CEFR level",
      "targetLevel": "B2",
      "tip": "o'zbek tilida nima yaxshilandi"
    }
  ],
  "suggestions": ["o'zbek tilida maslahat 1", "o'zbek tilida maslahat 2"]
}`;

    try {
      const content = await this.complete(prompt);
      if (!content) throw new Error('Empty response');

      const parsed = JSON.parse(content) as WritingFeedback;

      if (
        typeof parsed.correctedText !== 'string' ||
        typeof parsed.score !== 'number' ||
        !Array.isArray(parsed.mistakes) ||
        typeof parsed.overallFeedback !== 'string'
      ) {
        throw new Error('Invalid response structure');
      }

      parsed.score = Math.min(100, Math.max(0, Math.round(parsed.score)));
      parsed.suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
      parsed.levelUpExamples = Array.isArray(parsed.levelUpExamples) ? parsed.levelUpExamples : [];
      parsed.detectedLevel = parsed.detectedLevel || 'B1';
      // Remove mistakes where original is empty
      parsed.mistakes = parsed.mistakes.filter((m) => m.original && m.original.trim().length > 0);

      return parsed;
    } catch (error: any) {
      this.logger.error('AI writing check failed:', error?.message ?? error);
      if (error instanceof SyntaxError) {
        throw new InternalServerErrorException('AI javobini qayta ishlashda xato');
      }
      throw new InternalServerErrorException('AI tekshiruv vaqtida xato yuz berdi');
    }
  }

  async generateWords(topic: string, count: number): Promise<GeneratedWord[]> {
    const safeCount = Math.min(Math.max(1, count), 50);
    const safeTopic = topic.trim().slice(0, 100);

    const prompt = `Ingliz tili lug'ati uchun "${safeTopic}" mavzusida ${safeCount} ta so'z yarating.

Har bir so'z uchun:
- Ingliz so'zi (oddiy, amalda ishlatiladigan)
- O'zbek tarjimasi
- Ingliz tilidagi misol jumla
- Misolning o'zbekcha tarjimasi
- Daraja: A1, A2, B1, B2, C1 yoki C2
- Kategoriya: so'zning asosiy mavzusini inglizcha 1 so'z bilan (masalan: food, travel, technology, health, business, nature, sports, education, family)

JSON formatida qaytaring:
{
  "words": [
    {
      "word": "inglizcha so'z",
      "translation": "o'zbekcha tarjima",
      "example": "English example sentence.",
      "exampleUz": "O'zbekcha tarjima.",
      "level": "A1",
      "category": "food"
    }
  ]
}

Faqat JSON qaytaring. Takrorlanmagan, amalda foydali so'zlarni tanlang.`;

    try {
      const content = await this.complete(prompt, true);
      if (!content) throw new Error('Empty response');

      const parsed = JSON.parse(content) as { words: GeneratedWord[] };
      if (!Array.isArray(parsed.words)) throw new Error('words array missing');

      const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      return parsed.words
        .filter((w) => w.word && w.translation && w.example && validLevels.includes(w.level))
        .map((w) => ({ ...w, category: w.category?.toLowerCase().trim() || safeTopic.toLowerCase() }))
        .slice(0, safeCount);
    } catch (error: any) {
      this.logger.warn('AI word generation failed, using fallback:', error?.message ?? error);
      return getFallbackWords(topic, safeCount);
    }
  }

  async transcribeSpeech(audioBuffer: Buffer, mimeType: string): Promise<string> {
    this.logger.warn('transcribeSpeech not supported with Groq');
    throw new InternalServerErrorException('Ovozni matnga aylantirishda xato');
  }
}
