import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Post('heartbeat')
  heartbeat(@CurrentUser('id') userId: string) {
    return this.usersService.heartbeat(userId);
  }

  @Put('profile')
  updateProfile(@CurrentUser('id') userId: string, @Body() body: { name?: string }) {
    return this.usersService.updateProfile(userId, body);
  }
}
