import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReadingService } from './reading.service';
import { GenerateReadingDto } from './dto/generate-reading.dto';
import { SaveWordDto } from './dto/save-word.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reading')
@UseGuards(AuthGuard('jwt'))
export class ReadingController {
  constructor(private readingService: ReadingService) {}

  @Post('generate')
  generate(@Body() dto: GenerateReadingDto) {
    return this.readingService.generate(dto);
  }

  @Post('save-word')
  saveWord(
    @CurrentUser('id') userId: string,
    @Body() dto: SaveWordDto,
  ) {
    return this.readingService.saveWord(userId, dto);
  }
}
