import { IsString, IsBoolean } from 'class-validator';

export class ReviewWordDto {
  @IsString()
  wordId: string;

  @IsBoolean()
  correct: boolean;
}
