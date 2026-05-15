import { IsString, MinLength, MaxLength, IsInt, Min, Max } from 'class-validator';

export class GenerateWordsDto {
  @IsString()
  @MinLength(2, { message: 'Mavzu kamida 2 ta belgi' })
  @MaxLength(100, { message: 'Mavzu 100 ta belgidan oshmasin' })
  topic: string;

  @IsInt({ message: "So'zlar soni butun son bo'lishi kerak" })
  @Min(1, { message: "Kamida 1 ta so'z" })
  @Max(50, { message: "Maksimal 50 ta so'z" })
  count: number;
}
