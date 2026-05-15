import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateReadingDto } from './dto/generate-reading.dto';
import { SaveWordDto } from './dto/save-word.dto';

export interface ReadingSource {
  title: string;
  author?: string;
  year?: string;
  type: 'original' | 'adapted' | 'ai';
}

export interface ReadingPassage {
  title: string;
  type: string;
  level: string;
  content: string;
  wordCount: number;
  source: ReadingSource;
  vocabulary: { word: string; definition: string; translation: string }[];
  questions: { question: string; answer: string }[];
}

@Injectable()
export class ReadingService {
  private readonly logger = new Logger(ReadingService.name);
  private groq: Groq;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.groq = new Groq({ apiKey: config.get('GROQ_API_KEY') ?? '' });
  }

  async generate(dto: GenerateReadingDto): Promise<ReadingPassage> {
    const level = dto.level ?? 'B1';
    const levelGuide: Record<string, string> = {
      A1: '80-150 words, very simple sentences, present tense only, common everyday words',
      A2: '150-250 words, simple sentences, basic tenses, familiar topics',
      B1: '250-350 words, some complex sentences, varied tenses, common idioms',
      B2: '350-450 words, complex sentences, varied vocabulary, collocations',
      C1: '450-550 words, sophisticated language, nuanced vocabulary, idiomatic expressions',
      C2: '500-600 words, near-native complexity, rich vocabulary, literary style',
    };

    const prompt = `You are an English teacher creating reading material for language learners.

Generate a reading passage about: "${dto.topic}"
English level: ${level} (${levelGuide[level]})

IMPORTANT SOURCE RULES:
- If the topic relates to a famous literary work (Shakespeare, Dickens, Tolstoy, etc.), adapt an excerpt or scene from that work and set source accordingly.
- If the topic relates to a well-known historical event, famous person, scientific discovery, or cultural subject, base the text on real facts and set source accordingly.
- If the topic is general/fictional, create an original AI passage and set source.type to "ai".

Choose the best format: article, story, news report, or diary entry.

Return ONLY valid JSON:
{
  "title": "Engaging title",
  "type": "article|story|news|diary",
  "level": "${level}",
  "content": "Full passage text. Plain text, paragraphs separated by \\n\\n.",
  "source": {
    "title": "Name of the work, event, or topic this is based on (e.g. 'Romeo and Juliet', 'The French Revolution', 'Original text')",
    "author": "Author name if applicable, otherwise omit",
    "year": "Year or period if applicable, otherwise omit",
    "type": "original|adapted|ai"
  },
  "vocabulary": [
    {"word": "word from passage", "definition": "clear English definition", "translation": "O'zbek tilidagi tarjima"}
  ],
  "questions": [
    {"question": "Comprehension question?", "answer": "Answer from the text."}
  ]
}

Rules:
- source.type: "adapted" = based on real literary/historical source; "original" = real facts, AI-written; "ai" = fully invented
- vocabulary: 5-7 most useful/challenging words from the passage
- questions: 3-4 comprehension questions with answers from the passage
- translations must be in UZBEK
- Return only JSON`;

    try {
      const res = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = res.choices[0]?.message?.content ?? '';
      const parsed = JSON.parse(content);

      parsed.vocabulary = Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [];
      parsed.questions = Array.isArray(parsed.questions) ? parsed.questions : [];
      parsed.wordCount = parsed.content?.split(/\s+/).filter(Boolean).length ?? 0;
      parsed.level = level;
      parsed.source = parsed.source ?? { title: 'AI tomonidan yaratilgan', type: 'ai' };

      return parsed as ReadingPassage;
    } catch (error: any) {
      this.logger.error('Reading generation failed:', error?.message);
      throw new InternalServerErrorException('Matn yaratishda xato yuz berdi');
    }
  }

  async saveWord(userId: string, dto: SaveWordDto): Promise<{ saved: boolean; alreadyExisted: boolean }> {
    const levelMap: Record<string, any> = {
      A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2',
    };
    const wordLevel = levelMap[dto.level] ?? 'B1';

    // Upsert the word globally
    const word = await this.prisma.word.upsert({
      where: { word: dto.word.toLowerCase() },
      create: {
        word: dto.word.toLowerCase(),
        translation: dto.translation,
        example: dto.definition,
        level: wordLevel,
        category: 'reading',
      },
      update: {},
    });

    // Check if user already has this word
    const existing = await this.prisma.userProgress.findUnique({
      where: { userId_wordId: { userId, wordId: word.id } },
    });

    if (existing) {
      return { saved: false, alreadyExisted: true };
    }

    // Create UserProgress so it appears in the user's vocabulary
    await this.prisma.userProgress.create({
      data: {
        userId,
        wordId: word.id,
        interval: 0,
        correctCount: 0,
        nextReviewDate: new Date(),
      },
    });

    return { saved: true, alreadyExisted: false };
  }
}
