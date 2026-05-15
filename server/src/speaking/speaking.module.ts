import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SpeakingController } from './speaking.controller';
import { SpeakingService } from './speaking.service';

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  controllers: [SpeakingController],
  providers: [SpeakingService],
})
export class SpeakingModule {}
