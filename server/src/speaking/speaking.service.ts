import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { toFile } from 'groq-sdk';

@Injectable()
export class SpeakingService {
  private readonly logger = new Logger(SpeakingService.name);
  private groq: Groq;

  constructor(private config: ConfigService) {
    this.groq = new Groq({ apiKey: config.get('GROQ_API_KEY') ?? '' });
  }

  async transcribeAndAnalyze(audioBuffer: Buffer, mimeType: string) {
    // 1. Transcribe with Groq Whisper
    let transcript: string;
    try {
      const ext = mimeType.includes('webm') ? 'webm'
        : mimeType.includes('mp4') ? 'mp4'
        : mimeType.includes('ogg') ? 'ogg'
        : mimeType.includes('wav') ? 'wav'
        : 'webm';

      const file = await toFile(audioBuffer, `audio.${ext}`, { type: mimeType });
      const response = await this.groq.audio.transcriptions.create({
        file,
        model: 'whisper-large-v3-turbo',
        language: 'en',
        response_format: 'text',
      });
      transcript = typeof response === 'string' ? (response as string).trim() : ((response as any).text?.trim() ?? '');
    } catch (error: any) {
      this.logger.error('Whisper transcription failed:', error?.message);
      throw new InternalServerErrorException('Ovozni matnga aylantirishda xato');
    }

    if (!transcript) {
      throw new InternalServerErrorException('Ovoz aniqlanmadi. Mikrofonga aniqroq gapirib ko\'ring');
    }

    // 2. AI feedback on spoken English
    let feedback: any;
    try {
      const prompt = `You are an English speaking coach. A student said the following (transcribed from speech):

"${transcript}"

Analyze their spoken English and provide feedback in this exact JSON format:
{
  "transcript": "${transcript.replace(/"/g, '\\"')}",
  "score": 85,
  "detectedLevel": "B1",
  "pronunciation": "o'zbek tilida talaffuz haqida izoh",
  "grammar": "o'zbek tilida grammatika haqida izoh",
  "vocabulary": "o'zbek tilida so'z boyligi haqida izoh",
  "strengths": ["kuchli tomoni 1 o'zbek tilida", "kuchli tomoni 2"],
  "improvements": ["yaxshilash kerak 1 o'zbek tilida", "yaxshilash kerak 2"],
  "betterWayToSay": "same idea but expressed more naturally in English at a higher level"
}

Score: 90-100=excellent, 75-89=good, 60-74=average, below 60=needs work.
All feedback fields must be in UZBEK language. "betterWayToSay" must be in ENGLISH.
Return only valid JSON.`;

      const res = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = res.choices[0]?.message?.content ?? '';
      feedback = JSON.parse(content);
      feedback.score = Math.min(100, Math.max(0, Math.round(feedback.score ?? 75)));
      feedback.strengths = Array.isArray(feedback.strengths) ? feedback.strengths : [];
      feedback.improvements = Array.isArray(feedback.improvements) ? feedback.improvements : [];
    } catch (error: any) {
      this.logger.error('Speaking AI analysis failed:', error?.message);
      // Return basic feedback if AI fails
      feedback = {
        transcript,
        score: 75,
        detectedLevel: 'B1',
        pronunciation: 'Baholash amalga oshmadi',
        grammar: 'Baholash amalga oshmadi',
        vocabulary: 'Baholash amalga oshmadi',
        strengths: [],
        improvements: [],
        betterWayToSay: transcript,
      };
    }

    return { ...feedback, transcript };
  }
}
