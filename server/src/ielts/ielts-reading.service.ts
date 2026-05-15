import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

export type QuestionType = 'tfng' | 'mcq' | 'completion';

export interface ReadingQuestion {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
}

export interface IeltsPassage {
  title: string;
  passage: string;
  wordCount: number;
  questions: ReadingQuestion[];
}

const TOPICS = [
  'climate change and renewable energy',
  'artificial intelligence in modern society',
  'urbanisation and global cities',
  'the psychology of decision making',
  'space exploration and future colonisation',
  'digital technology and education',
  'biodiversity and environmental conservation',
  'globalisation and cultural identity',
];

@Injectable()
export class IeltsReadingService {
  private readonly logger = new Logger(IeltsReadingService.name);
  private groq: Groq;

  constructor(private config: ConfigService) {
    this.groq = new Groq({ apiKey: config.get('GROQ_API_KEY') ?? '' });
  }

  async generatePassage(topic?: string): Promise<IeltsPassage> {
    const chosenTopic = topic ?? TOPICS[Math.floor(Math.random() * TOPICS.length)];

    const prompt = `You are creating an IELTS Academic Reading passage.

Topic: "${chosenTopic}"

Generate an academic reading passage (~600 words) and exactly 13 questions:
- 5 True/False/Not Given (type: "tfng", answer: "True" | "False" | "Not Given")
- 4 Multiple Choice (type: "mcq", 4 options A–D, answer: the exact option text)
- 4 Sentence Completion (type: "completion", question has a blank ___, answer: 1–3 words from the passage)

IMPORTANT:
- The passage must be academic, formal, fact-based writing (like a real IELTS passage)
- TFNG answers must be strictly verifiable from the passage text
- MCQ wrong options must be plausible but clearly wrong to careful readers
- Completion answers must be exact words taken from the passage

Return ONLY valid JSON:
{
  "title": "Passage title",
  "passage": "Full passage text (~600 words)...",
  "questions": [
    { "id": 1, "type": "tfng", "question": "Statement to verify against passage.", "answer": "True" },
    { "id": 2, "type": "tfng", "question": "...", "answer": "False" },
    { "id": 3, "type": "tfng", "question": "...", "answer": "Not Given" },
    { "id": 4, "type": "tfng", "question": "...", "answer": "True" },
    { "id": 5, "type": "tfng", "question": "...", "answer": "False" },
    { "id": 6, "type": "mcq", "question": "According to the passage, ...", "options": ["option A", "option B", "option C", "option D"], "answer": "option A" },
    { "id": 7, "type": "mcq", "question": "...", "options": ["...","...","...","..."], "answer": "..." },
    { "id": 8, "type": "mcq", "question": "...", "options": ["...","...","...","..."], "answer": "..." },
    { "id": 9, "type": "mcq", "question": "...", "options": ["...","...","...","..."], "answer": "..." },
    { "id": 10, "type": "completion", "question": "Scientists claim that ___ is the primary driver of...", "answer": "exact words" },
    { "id": 11, "type": "completion", "question": "...", "answer": "..." },
    { "id": 12, "type": "completion", "question": "...", "answer": "..." },
    { "id": 13, "type": "completion", "question": "...", "answer": "..." }
  ]
}`;

    try {
      const res = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        response_format: { type: 'json_object' },
        max_tokens: 4000,
      });
      const parsed = JSON.parse(res.choices[0]?.message?.content ?? '{}');
      parsed.wordCount = (parsed.passage ?? '').trim().split(/\s+/).length;
      return parsed as IeltsPassage;
    } catch (err: any) {
      this.logger.error('IELTS reading generation failed:', err?.message);
      throw new InternalServerErrorException("O'qish matni yaratishda xato");
    }
  }

  scoreToBand(correct: number, total: number): number {
    const pct = correct / total;
    if (pct >= 0.95) return 9.0;
    if (pct >= 0.87) return 8.5;
    if (pct >= 0.80) return 8.0;
    if (pct >= 0.73) return 7.5;
    if (pct >= 0.67) return 7.0;
    if (pct >= 0.60) return 6.5;
    if (pct >= 0.53) return 6.0;
    if (pct >= 0.47) return 5.5;
    if (pct >= 0.40) return 5.0;
    if (pct >= 0.33) return 4.5;
    if (pct >= 0.27) return 4.0;
    if (pct >= 0.20) return 3.5;
    return 3.0;
  }
}
