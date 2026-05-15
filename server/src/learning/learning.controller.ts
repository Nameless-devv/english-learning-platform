import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LearningService } from './learning.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('learning')
@UseGuards(AuthGuard('jwt'))
export class LearningController {
  constructor(private learningService: LearningService) {}

  @Get('daily-plan')
  getDailyPlan(@CurrentUser('id') userId: string) {
    return this.learningService.getDailyPlan(userId);
  }

  @Post('daily-plan/complete/:planWordId')
  completePlanWord(
    @CurrentUser('id') userId: string,
    @Param('planWordId') planWordId: string,
  ) {
    return this.learningService.completePlanWord(userId, planWordId);
  }

  @Post('daily-plan/reset')
  resetDailyPlan(@CurrentUser('id') userId: string) {
    return this.learningService.resetDailyPlan(userId);
  }

  @Get('progress')
  getUserProgress(@CurrentUser('id') userId: string) {
    return this.learningService.getUserProgress(userId);
  }
}
