// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmailWithPassword(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      // Si la validación es exitosa, devolvemos el usuario sin la contraseña.
      // El método toJSON que creamos se encarga de esto automáticamente.
      return user;
    }
    return null;
  }

  login(user: UserDocument) {
    // El payload del token. Podemos incluir lo que sea útil.
    const payload = {
      email: user.email,
      sub: user._id, // 'sub' es la convención para el ID del sujeto (subject)
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
