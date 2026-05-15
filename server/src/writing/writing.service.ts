import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CheckWritingDto } from './dto/check-writing.dto';

@Injectable()
export class WritingService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async checkWriting(userId: string, dto: CheckWritingDto) {
    const feedback = await this.ai.checkWriting(dto.text);

    // Atomic write + XP increment in single transaction
    const [writing] = await this.prisma.$transaction([
      this.prisma.writing.create({
        data: {
          userId,
          text: dto.text,
          feedback: feedback as any,
          score: feedback.score,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: Math.floor(feedback.score / 10) } },
      }),
    ]);

    return { id: writing.id, ...feedback };
  }

  async getUserWritings(userId: string) {
    return this.prisma.writing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        text: true,
        feedback: true,
        score: true,
        createdAt: true,
      },
    });
  }

  async getWritingById(id: string, userId: string) {
    const writing = await this.prisma.writing.findFirst({ where: { id, userId } });
    if (!writing) return null;
    return writing;
  }
}
