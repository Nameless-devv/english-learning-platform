import { IsString, MaxLength } from 'class-validator';

export class SaveWordDto {
  @IsString()
  @MaxLength(100)
  word: string;

  @IsString()
  @MaxLength(300)
  definition: string;

  @IsString()
  @MaxLength(300)
  translation: string;

  @IsString()
  level: string;
}
