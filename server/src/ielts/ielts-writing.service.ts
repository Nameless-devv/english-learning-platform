import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

export interface WritingBandResult {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  overallBand: number;
  wordCount: number;
  feedback: {
    taskAchievement: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
    overall: string;
    suggestions: string[];
    improvedSentence: string;
  };
}

@Injectable()
export class IeltsWritingService {
  private readonly logger = new Logger(IeltsWritingService.name);
  private groq: Groq;

  constructor(private config: ConfigService) {
    this.groq = new Groq({ apiKey: config.get('GROQ_API_KEY') ?? '' });
  }

  async generatePrompt(taskType: 'task1' | 'task2'): Promise<{ prompt: string; context: string }> {
    const systemMsg = taskType === 'task1'
      ? `Generate an IELTS Academic Writing Task 1 prompt. Describe a chart/graph/diagram in TEXT form (since we cannot show images). Include specific numbers and data that the student should describe. Return JSON: { "prompt": "The bar chart below shows...", "context": "Key data points: ..." }`
      : `Generate an IELTS Academic Writing Task 2 essay question. Return JSON: { "prompt": "Some people believe that... Discuss both views and give your opinion.", "context": "Topic: [topic name]" }`;

    const res = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: systemMsg }],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });
    return JSON.parse(res.choices[0]?.message?.content ?? '{}');
  }

  async checkWriting(text: string, taskType: 'task1' | 'task2', prompt: string): Promise<WritingBandResult> {
    const wordCount = text.trim().split(/\s+/).length;
    const minWords = taskType === 'task1' ? 150 : 250;
    const criterion = taskType === 'task1' ? 'Task Achievement' : 'Task Response';

    const aiPrompt = `You are a strict IELTS examiner. Grade this IELTS Academic Writing ${taskType === 'task1' ? 'Task 1' : 'Task 2'} response.

TASK PROMPT:
${prompt}

STUDENT RESPONSE (${wordCount} words):
${text}

Minimum required words: ${minWords}. ${wordCount < minWords ? `PENALTY: student wrote only ${wordCount} words.` : ''}

Grade on the official IELTS 4 criteria (each 1.0–9.0, multiples of 0.5):
1. ${criterion}: Does the response fully address all parts of the task?
2. Coherence & Cohesion: Organisation, paragraphing, linking devices
3. Lexical Resource: Vocabulary range, accuracy, collocations
4. Grammatical Range & Accuracy: Sentence variety, tense accuracy, errors

Overall band = average of 4 criteria, rounded to nearest 0.5.

Return ONLY valid JSON:
{
  "taskAchievement": 6.5,
  "coherenceCohesion": 6.0,
  "lexicalResource": 6.5,
  "grammaticalRange": 6.0,
  "overallBand": 6.0,
  "feedback": {
    "taskAchievement": "O'zbek tilida: ...",
    "coherenceCohesion": "O'zbek tilida: ...",
    "lexicalResource": "O'zbek tilida: ...",
    "grammaticalRange": "O'zbek tilida: ...",
    "overall": "O'zbek tilida umumiy baho ...",
    "suggestions": ["O'zbek: 1-maslahat", "O'zbek: 2-maslahat", "O'zbek: 3-maslahat"],
    "improvedSentence": "Take one weak sentence from the response and rewrite it at Band 8 level in English."
  }
}`;

    try {
      const res = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: aiPrompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
      const parsed = JSON.parse(res.choices[0]?.message?.content ?? '{}');
      return { ...parsed, wordCount };
    } catch (err: any) {
      this.logger.error('IELTS writing check failed:', err?.message);
      throw new InternalServerErrorException('Yozuvni baholashda xato');
    }
  }
}
