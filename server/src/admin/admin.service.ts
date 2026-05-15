import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateWordDto } from './dto/create-word.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { GenerateWordsDto } from './dto/generate-words.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async getUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          streak: true,
          xp: true,
          totalMinutes: true,
          lastActiveAt: true,
          createdAt: true,
          _count: { select: { progress: true, writings: true, dailyPlans: true } },
        },
        orderBy: { lastActiveAt: { sort: 'desc', nulls: 'last' } },
      }),
      this.prisma.user.count(),
    ]);

    // Add learnedWords count per user
    const userIds = users.map((u) => u.id);
    const learnedCounts = await this.prisma.userProgress.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, correctCount: { gte: 1 } },
      _count: { userId: true },
    });
    const learnedMap = Object.fromEntries(learnedCounts.map((r) => [r.userId, r._count.userId]));

    const enriched = users.map((u) => ({
      ...u,
      learnedWords: learnedMap[u.id] ?? 0,
    }));

    return { users: enriched, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getStats() {
    const [totalUsers, totalWords, totalWritings, activeToday] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.word.count(),
      this.prisma.writing.count(),
      this.prisma.user.count({
        where: { lastActiveAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
    ]);
    return { totalUsers, totalWords, totalWritings, activeToday };
  }

  async createAdmin(dto: CreateAdminDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Bu email allaqachon roʻyxatdan oʻtgan');
    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { email: dto.email, password: hashed, name: dto.name, role: Role.ADMIN },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async changeUserRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Foydalanuvchi oʻchirildi' };
  }

  async createWord(dto: CreateWordDto) {
    return this.prisma.word.create({ data: dto });
  }

  async updateWord(id: string, dto: Partial<CreateWordDto>) {
    const word = await this.prisma.word.findUnique({ where: { id } });
    if (!word) throw new NotFoundException('Soʻz topilmadi');
    return this.prisma.word.update({ where: { id }, data: dto });
  }

  async deleteWord(id: string) {
    const word = await this.prisma.word.findUnique({ where: { id } });
    if (!word) throw new NotFoundException('Soʻz topilmadi');
    await this.prisma.word.delete({ where: { id } });
    return { message: 'Soʻz oʻchirildi' };
  }

  async generateWords(dto: GenerateWordsDto) {
    const generated = await this.ai.generateWords(dto.topic, dto.count);

    const results = { added: 0, skipped: 0, words: [] as any[] };

    for (const w of generated) {
      try {
        const word = await this.prisma.word.upsert({
          where: { word: w.word.toLowerCase().trim() },
          create: {
            word: w.word.toLowerCase().trim(),
            translation: w.translation,
            example: w.example,
            exampleUz: w.exampleUz,
            level: w.level,
            category: (w as any).category || null,
          },
          update: {
            translation: w.translation,
            example: w.example,
            exampleUz: w.exampleUz,
            level: w.level,
            category: (w as any).category || null,
          },
        });
        results.words.push(word);
        results.added++;
      } catch {
        results.skipped++;
      }
    }

    return results;
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: { include: { word: true }, orderBy: { updatedAt: 'desc' }, take: 20 },
        writings: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { progress: true, writings: true } },
      },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    const { password, ...safe } = user;
    return safe;
  }
}
