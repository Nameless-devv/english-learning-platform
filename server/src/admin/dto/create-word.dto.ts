import { IsString, IsOptional, IsEnum } from 'class-validator';
import { WordLevel } from '@prisma/client';

export class CreateWordDto {
  @IsString()
  word: string;

  @IsString()
  translation: string;

  @IsOptional()
  @IsString()
  example?: string;

  @IsOptional()
  @IsString()
  exampleUz?: string;

  @IsOptional()
  @IsEnum(WordLevel)
  level?: WordLevel;
}
