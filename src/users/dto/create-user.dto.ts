// src/users/dto/create-user.dto.ts

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail({}, { message: 'El formato del email no es válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de teléfono no puede estar vacío' })
  phone: string;

  @IsOptional()
  @IsUrl({}, { message: 'El formato de la URL de la foto no es válido' })
  photoUrl?: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsEnum(UserRole, {
    message: `El rol debe ser uno de los siguientes: ${Object.values(UserRole).join(', ')}`,
  })
  role: UserRole;
}
