import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WritingService } from './writing.service';
import { CheckWritingDto } from './dto/check-writing.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('writing')
@UseGuards(AuthGuard('jwt'))
export class WritingController {
  constructor(private writingService: WritingService) {}

  @Post('check')
  checkWriting(@CurrentUser('id') userId: string, @Body() dto: CheckWritingDto) {
    return this.writingService.checkWriting(userId, dto);
  }

  @Get()
  getUserWritings(@CurrentUser('id') userId: string) {
    return this.writingService.getUserWritings(userId);
  }

  @Get(':id')
  getWritingById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.writingService.getWritingById(id, userId);
  }
}
