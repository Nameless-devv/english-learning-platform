import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { toFile } from 'groq-sdk';

export interface SpeakingBandResult {
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  overallBand: number;
  transcript: string;
  feedback: {
    fluencyCoherence: string;
    lexicalResource: string;
    grammaticalRange: string;
    pronunciation: string;
    overall: string;
    strongPoints: string[];
    improvements: string[];
    modelAnswer: string;
  };
}

const PART_DESCRIPTIONS = {
  1: 'Part 1 — Introduction & Interview (2–3 min): Familiar topics such as home, family, work, studies, hobbies.',
  2: 'Part 2 — Individual Long Turn (3–4 min): Student speaks for 1–2 minutes about a cue card topic.',
  3: 'Part 3 — Two-way Discussion (4–5 min): Abstract, analytical questions linked to Part 2 topic.',
};

@Injectable()
export class IeltsSpeakingService {
  private readonly logger = new Logger(IeltsSpeakingService.name);
  private groq: Groq;

  constructor(private config: ConfigService) {
    this.groq = new Groq({ apiKey: config.get('GROQ_API_KEY') ?? '' });
  }

  async getPrompt(part: 1 | 2 | 3, topic?: string): Promise<any> {
    const prompts: Record<number, object> = {
      1: {
        part: 1,
        title: 'Part 1: Introduction',
        instructions: 'Answer these questions naturally. Speak for about 2–3 minutes total.',
        questions: [
          'Can you tell me a little about yourself and where you are from?',
          'What do you do — are you a student or do you work?',
          'What do you enjoy doing in your free time?',
          'How important is learning English to you and why?',
        ],
      },
      2: {
        part: 2,
        title: 'Part 2: Cue Card',
        instructions: 'You have 1 minute to prepare, then speak for 1–2 minutes.',
        cueCard: topic ?? 'Describe a memorable trip or journey you have taken.\nYou should say:\n• where you went\n• who you went with\n• what you did there\nAnd explain why it was memorable.',
        followUp: 'Do you think travel broadens the mind? Why or why not?',
      },
      3: {
        part: 3,
        title: 'Part 3: Discussion',
        instructions: 'Answer these abstract questions. Give extended, reasoned responses.',
        questions: [
          'How has travel changed in the modern world compared to the past?',
          'Some people say that tourism can damage local cultures. To what extent do you agree?',
          'What responsibilities do governments have regarding international tourism?',
        ],
      },
    };
    return prompts[part] ?? prompts[1];
  }

  async analyzeSpeech(audioBuffer: Buffer, mimeType: string, part: number, promptText: string): Promise<SpeakingBandResult> {
    const ext = mimeType.includes('webm') ? 'webm'
      : mimeType.includes('mp4') ? 'mp4'
      : mimeType.includes('ogg') ? 'ogg'
      : mimeType.includes('wav') ? 'wav'
      : 'webm';

    let transcript: string;
    try {
      const file = await toFile(audioBuffer, `audio.${ext}`, { type: mimeType });
      const response = await this.groq.audio.transcriptions.create({
        file,
        model: 'whisper-large-v3-turbo',
        language: 'en',
        response_format: 'text',
      });
      transcript = typeof response === 'string'
        ? (response as string).trim()
        : ((response as any).text?.trim() ?? '');
    } catch (err: any) {
      this.logger.error('Whisper failed:', err?.message);
      throw new InternalServerErrorException('Ovozni matnga aylantirishda xato');
    }

    if (!transcript) throw new InternalServerErrorException("Ovoz aniqlanmadi. Mikrofonga aniqroq gapirib ko'ring");

    const aiPrompt = `You are a strict IELTS Speaking examiner. Grade this ${PART_DESCRIPTIONS[part] ?? 'IELTS Speaking'} response.

PROMPT GIVEN TO STUDENT:
${promptText}

STUDENT SAID (transcribed):
"${transcript}"

Grade on 4 IELTS Speaking criteria (each 1.0–9.0, multiples of 0.5):
1. Fluency & Coherence: Pace, hesitations, logical flow
2. Lexical Resource: Vocabulary range, idiomatic language, collocations
3. Grammatical Range & Accuracy: Sentence variety, tense accuracy, errors
4. Pronunciation: Clarity, word stress, intonation (infer from word choices and patterns)

Overall band = average of 4 criteria, rounded to nearest 0.5.

Return ONLY valid JSON:
{
  "fluencyCoherence": 6.5,
  "lexicalResource": 6.0,
  "grammaticalRange": 6.5,
  "pronunciation": 6.0,
  "overallBand": 6.5,
  "transcript": "${transcript.replace(/"/g, '\\"').slice(0, 500)}",
  "feedback": {
    "fluencyCoherence": "O'zbek tilida: ...",
    "lexicalResource": "O'zbek tilida: ...",
    "grammaticalRange": "O'zbek tilida: ...",
    "pronunciation": "O'zbek tilida: ...",
    "overall": "O'zbek tilida umumiy baho ...",
    "strongPoints": ["O'zbek: kuchli tomon 1", "O'zbek: kuchli tomon 2"],
    "improvements": ["O'zbek: yaxshilash 1", "O'zbek: yaxshilash 2"],
    "modelAnswer": "A Band 8 model answer for this prompt in English (3–5 sentences)."
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
      parsed.transcript = transcript;
      return parsed as SpeakingBandResult;
    } catch (err: any) {
      this.logger.error('IELTS speaking analysis failed:', err?.message);
      throw new InternalServerErrorException('Nutqni baholashda xato');
    }
  }
}
