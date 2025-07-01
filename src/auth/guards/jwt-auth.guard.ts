// src/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// El string 'jwt' corresponde al nombre por defecto de la JwtStrategy.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
