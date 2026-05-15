import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  async getDailyPlan(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let plan = await this.prisma.dailyPlan.findUnique({
      where: { userId_date: { userId, date: today } },
      include: { words: { include: { word: true } } },
    });

    if (!plan) {
      plan = await this.createDailyPlan(userId, today);
    }

    const newWords = plan.words.filter((w) => w.isNew && !w.completed);
    const reviewWords = plan.words.filter((w) => !w.isNew && !w.completed);
    const completedWords = plan.words.filter((w) => w.completed);

    return {
      id: plan.id,
      date: plan.date,
      completed: plan.completed,
      progress: {
        total: plan.words.length,
        completed: completedWords.length,
        percentage:
          plan.words.length > 0
            ? Math.round((completedWords.length / plan.words.length) * 100)
            : 100,
      },
      newWords: newWords.map((w) => ({ planWordId: w.id, ...w.word })),
      reviewWords: reviewWords.map((w) => ({ planWordId: w.id, ...w.word })),
    };
  }

  async completePlanWord(userId: string, planWordId: string) {
    const planWord = await this.prisma.dailyPlanWord.findFirst({
      where: { id: planWordId, dailyPlan: { userId } },
      include: { dailyPlan: true },
    });

    if (!planWord) return null;

    await this.prisma.dailyPlanWord.update({
      where: { id: planWordId },
      data: { completed: true },
    });

    // For new words: create UserProgress so spaced repetition starts
    if (planWord.isNew) {
      await this.prisma.userProgress.upsert({
        where: { userId_wordId: { userId, wordId: planWord.wordId } },
        update: {},
        create: {
          userId,
          wordId: planWord.wordId,
          nextReviewDate: new Date(Date.now() + 86_400_000),
        },
      });
    }

    const remaining = await this.prisma.dailyPlanWord.count({
      where: { dailyPlanId: planWord.dailyPlanId, completed: false },
    });

    if (remaining === 0) {
      await this.prisma.$transaction([
        this.prisma.dailyPlan.update({
          where: { id: planWord.dailyPlanId },
          data: { completed: true },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: 50 } },
        }),
      ]);
    }

    return { completed: remaining === 0 };
  }

  async getUserProgress(userId: string) {
    const [totalWritings, totalWords, learnedWords, userInfo] = await Promise.all([
      this.prisma.writing.count({ where: { userId } }),
      this.prisma.word.count(),
      this.prisma.userProgress.count({ where: { userId, correctCount: { gte: 1 } } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true, xp: true },
      }),
    ]);

    // Build last 7 days activity — fill missing days with completed: false
    const plans = await this.prisma.dailyPlan.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      select: { date: true, completed: true },
    });

    const planMap = new Map(
      plans.map((p) => [p.date.toISOString().slice(0, 10), p.completed]),
    );

    const recentActivity = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { date: d, completed: planMap.get(key) ?? false };
    });

    return {
      totalWritings,
      totalWords,
      learnedWords,
      streak: userInfo?.streak ?? 0,
      xp: userInfo?.xp ?? 0,
      recentActivity,
    };
  }

  async resetDailyPlan(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.prisma.dailyPlan.deleteMany({ where: { userId, date: today } });
    return this.createDailyPlan(userId, today);
  }

  private async createDailyPlan(userId: string, date: Date) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { dailyGoal: true } });
    const dailyGoal = user?.dailyGoal ?? 5;

    const learnedWordIds = await this.prisma.userProgress
      .findMany({ where: { userId }, select: { wordId: true } })
      .then((p) => p.map((x) => x.wordId));

    const newWords = await this.prisma.word.findMany({
      where: { id: { notIn: learnedWordIds } },
      orderBy: [{ level: 'asc' }, { word: 'asc' }],
      take: dailyGoal,
    });

    const reviewWords = await this.prisma.userProgress.findMany({
      where: { userId, nextReviewDate: { lte: new Date() } },
      include: { word: true },
      orderBy: { nextReviewDate: 'asc' },
      take: dailyGoal,
    });

    // Auto-complete plan if nothing to study
    const autoComplete = newWords.length === 0 && reviewWords.length === 0;

    const plan = await this.prisma.dailyPlan.create({
      data: {
        userId,
        date,
        completed: autoComplete,
        words: {
          create: [
            ...newWords.map((w) => ({ wordId: w.id, isNew: true })),
            ...reviewWords.map((p) => ({ wordId: p.wordId, isNew: false })),
          ],
        },
      },
      include: { words: { include: { word: true } } },
    });

    return plan;
  }
}
