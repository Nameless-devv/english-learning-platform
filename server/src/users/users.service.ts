import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, role: true,
        streak: true, xp: true, lastActiveAt: true, createdAt: true,
        dailyGoal: true, englishLevel: true, onboardingDone: true,
        _count: { select: { progress: true, writings: true } },
      },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  async heartbeat(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { totalMinutes: { increment: 1 }, lastActiveAt: new Date() },
    });
    return { ok: true };
  }

  async updateProfile(userId: string, data: { name?: string; dailyGoal?: number; englishLevel?: string; onboardingDone?: boolean }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, role: true, streak: true, xp: true, dailyGoal: true, englishLevel: true, onboardingDone: true },
    });
  }
}
