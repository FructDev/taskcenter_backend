// src/auth/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    // Obtenemos el secreto de la configuración
    const secret = configService.get<string>('JWT_SECRET');

    // Si el secreto no está definido, la aplicación no debe iniciar.
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en el archivo .env');
    }

    // Ahora pasamos la variable 'secret' validada, que TypeScript sabe que es un string.
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // ... (el método validate se mantiene igual) ...
  async validate(payload: { sub: string; email: string }) {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }

    return user;
  }
}
