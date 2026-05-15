import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { CreateWordDto } from './dto/create-word.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { GenerateWordsDto } from './dto/generate-words.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.adminService.getUsers(+page, +limit);
  }

  @Post('users/create-admin')
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @Put('users/:id/role')
  changeUserRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.adminService.changeUserRole(id, role);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('users/:id')
  getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Post('words')
  createWord(@Body() dto: CreateWordDto) {
    return this.adminService.createWord(dto);
  }

  @Post('words/generate')
  @HttpCode(HttpStatus.OK)
  generateWords(@Body() dto: GenerateWordsDto) {
    return this.adminService.generateWords(dto);
  }

  @Put('words/:id')
  updateWord(@Param('id') id: string, @Body() dto: Partial<CreateWordDto>) {
    return this.adminService.updateWord(id, dto);
  }

  @Delete('words/:id')
  deleteWord(@Param('id') id: string) {
    return this.adminService.deleteWord(id);
  }
}
