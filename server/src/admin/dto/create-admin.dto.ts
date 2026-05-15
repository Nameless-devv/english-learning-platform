import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateAdminDto {
  @IsEmail({}, { message: 'Email manzil notoʻgʻri' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Parol kamida 8 ta belgidan iborat boʻlishi kerak' })
  @MaxLength(50)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
