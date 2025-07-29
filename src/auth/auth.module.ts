// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module'; // Necesitamos acceso a los usuarios
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Importamos UsersModule para poder usar UsersService
    UsersModule,
    // Configuración básica de Passport
    PassportModule,
    // Configuración del Módulo JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Leemos el secreto de nuestras variables de entorno
        secret: configService.get<string>('JWT_SECRET'),
        // Establecemos un tiempo de expiración para el token
        signOptions: { expiresIn: '30d' }, // ej. 1 día
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy], // Añadiremos los providers en los siguientes pasos
})
export class AuthModule {}
