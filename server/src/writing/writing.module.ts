import { Module } from '@nestjs/common';
import { WritingController } from './writing.controller';
import { WritingService } from './writing.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [WritingController],
  providers: [WritingService],
})
export class WritingModule {}
