// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

// Esta es la clave que usaremos para guardar y leer los metadatos de los roles
export const ROLES_KEY = 'roles';

// El decorador @Roles(...) simplemente adjunta los roles como metadatos a la ruta
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
