// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  Body,
  UploadedFile,
  Req,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseInterceptors,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UsersService } from 'src/users/users.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard) // Protegemos la ruta con nuestro Guard
  @Post('login')
  login(@Request() req) {
    // Si llegamos aquí, el usuario ya fue validado por LocalStrategy
    // y el objeto 'user' fue añadido a la Request.
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard) // Protegemos la ruta, solo para usuarios con token válido
  @Get('profile')
  getProfile(@Request() req) {
    // El guard JwtAuthGuard ya ha validado el token y ha adjuntado
    // el objeto de usuario a la petición (en req.user).
    // Simplemente lo devolvemos. Nuestro método toJSON se encarga de la seguridad.
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto, // Usamos el mismo DTO de actualización de usuario
  ) {
    // Obtenemos el ID del usuario directamente del token (que está en req.user)
    // para asegurarnos de que solo pueda actualizar su propio perfil.
    // Reutilizamos nuestro método robusto y seguro de UsersService.
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Post('profile/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file')) // 'file' es el nombre del campo que enviaremos
  updateUserPhoto(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Límite de 2MB
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
          // Solo aceptar imágenes jpeg y png
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.usersService.updateProfilePicture(userId, file);
  }
}
