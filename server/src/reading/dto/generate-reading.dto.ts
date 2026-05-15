import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class GenerateReadingDto {
  @IsString()
  @MaxLength(100)
  topic: string;

  @IsOptional()
  @IsIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  level?: string;
}
