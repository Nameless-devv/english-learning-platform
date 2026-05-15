import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { WritingModule } from './writing/writing.module';
import { LearningModule } from './learning/learning.module';
import { AiModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';
import { SpeakingModule } from './speaking/speaking.module';
import { ReadingModule } from './reading/reading.module';
import { GrammarModule } from './grammar/grammar.module';
import { IeltsModule } from './ielts/ielts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    VocabularyModule,
    WritingModule,
    LearningModule,
    AiModule,
    AdminModule,
    SpeakingModule,
    ReadingModule,
    GrammarModule,
    IeltsModule,
  ],
})
export class AppModule {}
