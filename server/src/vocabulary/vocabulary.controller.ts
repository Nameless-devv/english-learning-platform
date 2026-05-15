import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VocabularyService } from './vocabulary.service';
import { ReviewWordDto } from './dto/review-word.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('words')
@UseGuards(AuthGuard('jwt'))
export class VocabularyController {
  constructor(private vocabularyService: VocabularyService) {}

  @Get('daily')
  getDailyWords(@CurrentUser('id') userId: string) {
    return this.vocabularyService.getDailyWords(userId);
  }

  @Post('review')
  reviewWord(@CurrentUser('id') userId: string, @Body() dto: ReviewWordDto) {
    return this.vocabularyService.reviewWord(userId, dto);
  }

  @Get()
  getAllWords(@Query('level') level?: string, @Query('search') search?: string) {
    return this.vocabularyService.getAllWords({ level, search });
  }

  @Get('my')
  getMyWords(
    @CurrentUser('id') userId: string,
    @Query('category') category?: string,
    @Query('level') level?: string,
  ) {
    return this.vocabularyService.getUserLearnedWords(userId, { category, level });
  }

  @Get('stats')
  getStats(@CurrentUser('id') userId: string) {
    return this.vocabularyService.getUserStats(userId);
  }
}
