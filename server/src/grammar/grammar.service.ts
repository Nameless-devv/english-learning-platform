import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { GenerateGrammarDto } from './dto/generate-grammar.dto';

export type ExerciseType = 'fill_blank' | 'multiple_choice' | 'error_correction' | 'word_order';

export interface Exercise {
  type: ExerciseType;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface GrammarLesson {
  topic: string;
  level: string;
  tip: string;
  exercises: Exercise[];
}

@Injectable()
export class GrammarService {
  private readonly logger = new Logger(GrammarService.name);
  private groq: Groq;

  constructor(private config: ConfigService) {
    this.groq = new Groq({ apiKey: config.get('GROQ_API_KEY') ?? '' });
  }

  async generate(dto: GenerateGrammarDto): Promise<GrammarLesson> {
    const level = dto.level ?? 'B1';

    const LEVEL_GUIDANCE: Record<string, string> = {
      A1: `A1 (Complete Beginner): Use ONLY the simplest possible language.
- Vocabulary: cat, dog, house, eat, drink, go, big, small, I/you/he/she
- Structures: "I am a student.", "She eats rice.", "Is this a book?"
- Topics fitting A1: verb "to be", simple present for facts, basic articles (a/the), plurals, subject pronouns
- Sentences must be 5-7 words maximum, no complex clauses`,

      A2: `A2 (Elementary): Common everyday language, short simple sentences.
- Vocabulary: work, travel, family, weather, food, shopping (common nouns/verbs)
- Structures: present continuous, past simple (regular), going to future, comparatives (bigger than)
- Topics fitting A2: past simple regular verbs, there is/are, can/can't, simple questions (What/Where/When)
- Sentences 7-10 words, one clause`,

      B1: `B1 (Intermediate): Familiar topics, standard usage.
- Vocabulary: environment, opportunity, suggest, experience, advice, describe (functional language)
- Structures: present perfect (ever/never/just/already), 1st conditional, passive (simple), modals (should/must/might)
- Topics fitting B1: present perfect vs past simple, first conditional, passive voice simple, reported speech basics
- Sentences can have 2 clauses, familiar contexts (work, travel, studies)`,

      B2: `B2 (Upper-Intermediate): Abstract ideas, complex grammar, formal contexts.
- Vocabulary: substantial, reluctant, controversial, emphasise, negotiate, implication (academic/abstract)
- Structures: 2nd and 3rd conditionals, passive (all tenses), relative clauses (which/that/whose), gerunds vs infinitives (with meaning change), reported speech (all tenses)
- Topics fitting B2: mixed conditionals, complex passive, relative clauses with non-defining commas, gerund/infinitive distinctions
- Use formal/academic register, 2-3 clause sentences`,

      C1: `C1 (Advanced): Nuanced, idiomatic, complex academic language.
- Vocabulary: meticulous, pervasive, concede, albeit, notwithstanding, rhetoric, paradox
- Structures: inversion (Never had I...), cleft sentences (It was John who...), subjunctive (It is essential that he BE), advanced modals (would rather you didn't, needn't have done), nominalization, ellipsis
- Topics fitting C1: fronting/inversion for emphasis, cleft sentences, subjunctive mood, complex nominalization, discourse markers
- Formal/literary register, multi-clause sentences, subtle distinctions in meaning`,

      C2: `C2 (Mastery — near-native): Highly sophisticated, rare structures, subtle pragmatic distinctions.
- Vocabulary: perspicacious, recalcitrant, inveterate, mellifluous, obfuscate, predicated on, albeit, erstwhile
- Structures: advanced inversion (Should you require..., Were it not for...), ellipsis in formal writing, substitution, highly idiomatic expressions, subtle aspect distinctions (would vs used to for past habits), have something done (causative), advanced reported speech with modality
- Topics fitting C2: advanced conditionals with modal perfects (might have, should have), complex inversion, causative have/get, pragmatic nuance (understated irony, hedging in academic writing), distinctions between near-synonymous structures
- Use complex academic, literary, or professional English. Sentences 15-25 words. No simple everyday vocabulary.
- IMPORTANT: Exercises must be genuinely challenging even for advanced learners. Wrong options should be plausible near-correct forms, not obviously wrong.`,
    };

    const guidance = LEVEL_GUIDANCE[level] ?? LEVEL_GUIDANCE['B1'];

    const prompt = `You are a strict English grammar examiner creating ${level}-level exercises.

LEVEL REQUIREMENTS — READ CAREFULLY:
${guidance}

Topic: "${dto.topic}"

⚠️ CRITICAL: Every exercise MUST match ${level} difficulty exactly. Do NOT simplify. If the level is C1 or C2, use advanced, sophisticated language — not basic sentences.

Generate exactly 8 exercises in this mix:
- fill_blank (3): sentence with ___ blank, student writes the correct word/form
- multiple_choice (3): 4 plausible options (wrong options must look realistic, not obviously wrong)
- error_correction (1): a sentence with a subtle mistake appropriate for ${level}
- word_order (1): scrambled words that form a ${level}-appropriate sentence

Return ONLY valid JSON:
{
  "topic": "Grammar topic name",
  "level": "${level}",
  "tip": "Key grammar rule in UZBEK (2-3 sentences, include when/why this structure is used)",
  "exercises": [
    {
      "type": "fill_blank",
      "question": "Sentence with ___ blank (${level}-level vocabulary and structure).",
      "answer": "exact correct answer",
      "explanation": "O'zbek tilida: why this answer is correct, referencing the grammar rule."
    },
    {
      "type": "multiple_choice",
      "question": "Choose the correct form: She ___ to the office yesterday.",
      "options": ["go", "goes", "went", "has gone"],
      "answer": "went",
      "explanation": "O'zbek tilida izoh."
    },
    {
      "type": "error_correction",
      "question": "Find and correct: [sentence with a ${level}-appropriate subtle error]",
      "answer": "Corrected sentence.",
      "explanation": "O'zbek tilida: what the error was and why."
    },
    {
      "type": "word_order",
      "question": "Arrange: word1 / word2 / word3 / word4 / word5",
      "answer": "Correct sentence.",
      "explanation": "O'zbek tilida: the word order rule used."
    }
  ]
}

Rules:
- tip and ALL explanation fields → UZBEK language only
- questions and answers → ENGLISH only
- wrong options in multiple_choice must be plausible (not obviously wrong)
- for word_order: separate words with " / "
- for multiple_choice: exactly 4 options
- ⚠️ multiple_choice questions MUST test grammar, NOT factual knowledge. Never ask "What time does X open?" or "Where is X?". Always ask students to choose the correct grammatical form, tense, word order, or structure. Good formats: "Choose the correct form: He ___ there.", "Which sentence is grammatically correct?", "Select the right option: ___"
- Return ONLY the JSON object, no extra text`;

    try {
      const res = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      });

      const content = res.choices[0]?.message?.content ?? '';
      const parsed = JSON.parse(content);

      parsed.exercises = Array.isArray(parsed.exercises) ? parsed.exercises.slice(0, 10) : [];
      parsed.level = level;

      return parsed as GrammarLesson;
    } catch (error: any) {
      this.logger.error('Grammar generation failed:', error?.message);
      throw new InternalServerErrorException('Mashqlar yaratishda xato yuz berdi');
    }
  }
}
