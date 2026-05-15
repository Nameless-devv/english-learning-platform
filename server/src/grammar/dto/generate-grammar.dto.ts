import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class GenerateGrammarDto {
  @IsString()
  @MaxLength(80)
  topic: string;

  @IsOptional()
  @IsIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  level?: string;
}
