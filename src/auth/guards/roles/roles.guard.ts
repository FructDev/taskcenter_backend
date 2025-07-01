// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtenemos los roles requeridos del decorador @Roles que pusimos en la ruta
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta no tiene el decorador @Roles, permitimos el acceso
    if (!requiredRoles) {
      return true;
    }

    // Obtenemos el usuario del objeto Request (que JwtAuthGuard ya adjuntó)
    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario, denegamos (aunque JwtAuthGuard ya debería haberlo hecho)
    if (!user) {
      return false;
    }

    // Comprobamos si el rol del usuario está incluido en la lista de roles requeridos
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
