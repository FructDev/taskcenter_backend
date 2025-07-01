// src/users/dto/update-user.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// UpdateUserDto hereda todas las reglas de CreateUserDto, pero las hace opcionales.
export class UpdateUserDto extends PartialType(CreateUserDto) {}
