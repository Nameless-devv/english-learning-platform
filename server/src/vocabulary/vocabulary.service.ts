import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewWordDto } from './dto/review-word.dto';

const INTERVALS = [1, 2, 5, 10, 30];

function getNextInterval(currentInterval: number, correct: boolean): number {
  if (!correct) return 0;
  return Math.min(currentInterval + 1, INTERVALS.length - 1);
}

function getDaysUntilReview(intervalIndex: number): number {
  return INTERVALS[intervalIndex] ?? 1;
}

@Injectable()
export class VocabularyService {
  constructor(private prisma: PrismaService) {}

  async getDailyWords(userId: string) {
    const now = new Date();

    const dueReviews = await this.prisma.userProgress.findMany({
      where: { userId, nextReviewDate: { lte: now } },
      include: { word: true },
      orderBy: { nextReviewDate: 'asc' },
      take: undefined,
    });

    const allLearnedWordIds = await this.prisma.userProgress
      .findMany({ where: { userId }, select: { wordId: true } })
      .then((p) => p.map((x) => x.wordId));

    const newWords = await this.prisma.word.findMany({
      where: { id: { notIn: allLearnedWordIds } },
      orderBy: [{ level: 'asc' }, { word: 'asc' }],
      take: undefined,
    });

    return {
      newWords,
      reviewWords: dueReviews.map((p) => ({
        ...p.word,
        progressId: p.id,
        interval: p.interval,
        correctCount: p.correctCount,
      })),
    };
  }

  async reviewWord(userId: string, dto: ReviewWordDto) {
    let progress = await this.prisma.userProgress.findUnique({
      where: { userId_wordId: { userId, wordId: dto.wordId } },
    });

    if (!progress) {
      progress = await this.prisma.userProgress.create({
        data: { userId, wordId: dto.wordId },
      });
    }

    const newInterval = getNextInterval(progress.interval, dto.correct);
    const daysUntilReview = getDaysUntilReview(newInterval);

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + daysUntilReview);

    const [updated] = await this.prisma.$transaction([
      this.prisma.userProgress.update({
        where: { id: progress.id },
        data: {
          interval: newInterval,
          correctCount: dto.correct ? { increment: 1 } : undefined,
          incorrectCount: !dto.correct ? { increment: 1 } : undefined,
          nextReviewDate: nextReview,
          lastReviewedAt: new Date(),
        },
        include: { word: true },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: dto.correct ? 10 : 0 } },
      }),
    ]);

    // Sync: mark today's plan word as completed
    await this.markTodayPlanWordDone(userId, dto.wordId);

    await this.updateStreak(userId);

    return {
      word: updated.word,
      interval: updated.interval,
      nextReviewDate: updated.nextReviewDate,
      daysUntilReview,
      message: dto.correct
        ? `Toʻgʻri! Keyingi takrorlash ${daysUntilReview} kundan keyin`
        : 'Keyingi safar yaxshiroq qilasiz!',
    };
  }

  async getUserLearnedWords(userId: string, filters?: { category?: string; level?: string }) {
    const levelValid = filters?.level
      ? ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(filters.level)
      : false;

    const progress = await this.prisma.userProgress.findMany({
      where: { userId },
      include: { word: true },
      orderBy: { createdAt: 'asc' },
    });

    return progress
      .filter((p) => {
        if (!p.word) return false;
        if (levelValid && p.word.level !== (filters!.level as any)) return false;
        if (filters?.category && filters.category !== 'all' && p.word.category !== filters.category) return false;
        return true;
      })
      .map((p) => ({
        ...p.word,
        correctCount: p.correctCount,
        interval: p.interval,
        progressId: p.id,
      }));
  }

  async getAllWords(query?: { level?: string; search?: string }) {
    const levelValid = query?.level
      ? ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(query.level)
      : false;

    const search = query?.search?.trim().slice(0, 100);

    return this.prisma.word.findMany({
      where: {
        ...(levelValid ? { level: query!.level as any } : {}),
        ...(search ? { word: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: [{ level: 'asc' }, { word: 'asc' }],
    });
  }

  async getUserStats(userId: string) {
    const [total, learned, dueToday, user] = await Promise.all([
      this.prisma.word.count(),
      this.prisma.userProgress.count({ where: { userId, correctCount: { gte: 1 } } }),
      this.prisma.userProgress.count({
        where: { userId, nextReviewDate: { lte: new Date() } },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true, xp: true },
      }),
    ]);

    return {
      total,
      learned,
      dueToday,
      streak: user?.streak ?? 0,
      xp: user?.xp ?? 0,
    };
  }

  private async markTodayPlanWordDone(userId: string, wordId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const plan = await this.prisma.dailyPlan.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (!plan) return;

    await this.prisma.dailyPlanWord.updateMany({
      where: { dailyPlanId: plan.id, wordId, completed: false },
      data: { completed: true },
    });

    // Check if plan is now fully complete
    const remaining = await this.prisma.dailyPlanWord.count({
      where: { dailyPlanId: plan.id, completed: false },
    });

    if (remaining === 0 && !plan.completed) {
      await this.prisma.$transaction([
        this.prisma.dailyPlan.update({
          where: { id: plan.id },
          data: { completed: true },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: 50 } },
        }),
      ]);
    }
  }

  private async updateStreak(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastActiveAt: true, streak: true },
    });

    if (!user) return;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!user.lastActiveAt) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: now, streak: 1 },
      });
      return;
    }

    const lastActive = new Date(user.lastActiveAt);
    const lastDayStart = new Date(
      lastActive.getFullYear(),
      lastActive.getMonth(),
      lastActive.getDate(),
    );
    const diffDays = Math.floor(
      (todayStart.getTime() - lastDayStart.getTime()) / 86_400_000,
    );

    if (diffDays === 0) return; // Already active today

    const newStreak = diffDays === 1 ? user.streak + 1 : 1;

    await this.prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: now, streak: newStreak },
    });
  }
}
