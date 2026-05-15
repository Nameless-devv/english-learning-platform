import { IsString, MinLength, MaxLength } from 'class-validator';

export class CheckWritingDto {
  @IsString()
  @MinLength(10, { message: 'Matn kamida 10 ta belgidan iborat boʻlishi kerak' })
  @MaxLength(2000, { message: 'Matn 2000 ta belgidan oshmasligi kerak' })
  text: string;
}
