import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { SpeakingService } from './speaking.service';

@Controller('speaking')
@UseGuards(AuthGuard('jwt'))
export class SpeakingController {
  constructor(private speakingService: SpeakingService) {}

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio', { limits: { fileSize: 25 * 1024 * 1024 } }))
  async transcribe(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('Audio fayl topilmadi');
    return this.speakingService.transcribeAndAnalyze(file.buffer, file.mimetype);
  }
}
