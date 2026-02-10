import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class CreateTeacherDto {
  @IsEmail()
  email!: string;

  @IsOptional() // Made optional so the admin doesn't HAVE to type one
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  // минимум: буква и цифра (можешь ужесточить)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Password must contain letters and digits' })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;
}
