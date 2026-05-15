import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email manzil notoʻgʻri' })
  email: string;

  @IsString({ message: 'Parol kiritilishi shart' })
  password: string;
}
