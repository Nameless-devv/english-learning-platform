import {
  Controller, Post, Get, Body, Query, UseGuards,
  UseInterceptors, UploadedFile, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { memoryStorage } from 'multer';
import { IeltsWritingService } from './ielts-writing.service';
import { IeltsSpeakingService } from './ielts-speaking.service';
import { IeltsReadingService } from './ielts-reading.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ielts')
@UseGuards(AuthGuard('jwt'))
export class IeltsController {
  constructor(
    private writing: IeltsWritingService,
    private speaking: IeltsSpeakingService,
    private reading: IeltsReadingService,
    private prisma: PrismaService,
  ) {}

  // ── Writing ───────────────────────────────────────────────────────────────

  @Post('writing/generate')
  generateWritingPrompt(@Body('taskType') taskType: 'task1' | 'task2' = 'task2') {
    return this.writing.generatePrompt(taskType);
  }

  @Post('writing/check')
  async checkWriting(
    @CurrentUser('id') userId: string,
    @Body() body: { text: string; taskType: 'task1' | 'task2'; prompt: string },
  ) {
    const result = await this.writing.checkWriting(body.text, body.taskType, body.prompt);
    await this.prisma.ieltsResult.create({
      data: {
        userId,
        type: `writing_${body.taskType}`,
        band: result.overallBand,
        scores: {
          taskAchievement: result.taskAchievement,
          coherenceCohesion: result.coherenceCohesion,
          lexicalResource: result.lexicalResource,
          grammaticalRange: result.grammaticalRange,
        },
        feedback: result.feedback as any,
        prompt: body.prompt.slice(0, 500),
        text: body.text.slice(0, 1000),
      },
    });
    return result;
  }

  // ── Speaking ──────────────────────────────────────────────────────────────

  @Get('speaking/prompt')
  getSpeakingPrompt(
    @Query('part', new DefaultValuePipe(1), ParseIntPipe) part: number,
    @Query('topic') topic?: string,
  ) {
    return this.speaking.getPrompt(part as 1 | 2 | 3, topic);
  }

  @Post('speaking/analyze')
  @UseInterceptors(FileInterceptor('audio', {
    storage: memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
  }))
  async analyzeSpeaking(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: any,
    @Body('part') partStr: string,
    @Body('prompt') promptText: string,
  ) {
    const part = parseInt(partStr, 10) || 1;
    const result = await this.speaking.analyzeSpeech(file.buffer, file.mimetype, part, promptText);
    await this.prisma.ieltsResult.create({
      data: {
        userId,
        type: `speaking_part${part}`,
        band: result.overallBand,
        scores: {
          fluencyCoherence: result.fluencyCoherence,
          lexicalResource: result.lexicalResource,
          grammaticalRange: result.grammaticalRange,
          pronunciation: result.pronunciation,
        },
        feedback: result.feedback as any,
        prompt: promptText?.slice(0, 500),
        text: result.transcript?.slice(0, 1000),
      },
    });
    return result;
  }

  // ── Reading ───────────────────────────────────────────────────────────────

  @Post('reading/generate')
  generatePassage(@Body('topic') topic?: string) {
    return this.reading.generatePassage(topic);
  }

  @Post('reading/score')
  async scoreReading(
    @CurrentUser('id') userId: string,
    @Body() body: { correct: number; total: number; title: string },
  ) {
    const band = this.reading.scoreToBand(body.correct, body.total);
    await this.prisma.ieltsResult.create({
      data: {
        userId,
        type: 'reading',
        band,
        scores: { correct: body.correct, total: body.total },
        feedback: { title: body.title },
      },
    });
    return { band, correct: body.correct, total: body.total };
  }

  // ── Results ───────────────────────────────────────────────────────────────

  @Get('results')
  async getResults(@CurrentUser('id') userId: string) {
    const results = await this.prisma.ieltsResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, type: true, band: true, scores: true, createdAt: true },
    });
    return results;
  }
}
