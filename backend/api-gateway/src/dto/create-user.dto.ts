import { IsString, IsEmail, Length, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' })
  name: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}

export class LoginDTO {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
