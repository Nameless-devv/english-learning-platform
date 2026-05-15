import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { IeltsController } from './ielts.controller';
import { IeltsWritingService } from './ielts-writing.service';
import { IeltsSpeakingService } from './ielts-speaking.service';
import { IeltsReadingService } from './ielts-reading.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [IeltsController],
  providers: [IeltsWritingService, IeltsSpeakingService, IeltsReadingService],
})
export class IeltsModule {}
