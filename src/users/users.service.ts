// src/users/users.service.ts

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role, phone, department, photoUrl } =
      createUserDto;

    // 1. Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Crear el nuevo usuario con la contraseña hasheada
    const userToCreate = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      department,
      photoUrl,
    });

    // 3. Guardar y manejar errores (ej. email duplicado)
    try {
      const savedUser = await userToCreate.save();
      // La contraseña no se devolverá gracias al `select: false` en el Schema
      return savedUser;
    } catch (error) {
      this.logger.error(
        `Falló la creación del usuario. Error original: ${error.message}`,
        error.stack,
      );
      if (error.code === 11000) {
        // Error de índice único de MongoDB (email duplicado)
        throw new ConflictException('El correo electrónico ya está en uso');
      }
      // Para cualquier otro error, lanzamos un error genérico del servidor
      throw new InternalServerErrorException(
        'Algo salió mal al crear el usuario',
      );
    }
  }

  findAll() {
    // Devolveremos todos los usuarios (sin la contraseña)
    return this.userModel.find().exec();
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).exec();

    // Reutilizamos el patrón de manejo de error para 'no encontrado'
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }
    // El método toJSON se encargará de quitar la contraseña antes de devolver
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Si el DTO incluye una nueva contraseña, la hasheamos.
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();

      // Si el usuario no se encuentra, findByIdAndUpdate devuelve null.
      if (!updatedUser) {
        throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
      }

      return updatedUser;
    } catch (error) {
      // Manejamos el error de email duplicado también en la actualización.
      if (error.code === 11000) {
        throw new ConflictException('El correo electrónico ya está en uso');
      }
      throw new InternalServerErrorException(
        'Algo salió mal al actualizar el usuario',
      );
    }
  }

  async remove(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }

    // No devolvemos nada en el cuerpo, la operación fue exitosa.
    return;
  }

  async findOneByEmailWithPassword(email: string) {
    // Usamos .select('+password') para pedirle a Mongoose que incluya
    // explícitamente el campo de la contraseña en esta consulta específica.
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async updateProfilePicture(userId: string, file: Express.Multer.File) {
    // 1. Subimos el archivo a Cloudinary
    const uploadResult = await this.cloudinaryService.uploadFile(file);

    if (!uploadResult.secure_url) {
      throw new InternalServerErrorException('Falló la subida de la imagen.');
    }

    // 2. Actualizamos el usuario con la nueva URL de la foto
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { photoUrl: uploadResult.secure_url },
      { new: true }, // Devuelve el documento actualizado
    );

    if (!updatedUser) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado`);
    }

    return updatedUser;
  }

  async addFcmToken(userId: string, token: string) {
    return this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { fcmTokens: token } }, // $addToSet evita duplicados
    );
  }

  async removeFcmToken(userId: string, token: string) {
    return this.userModel.updateOne(
      { _id: userId },
      { $pull: { fcmTokens: token } },
    );
  }
}
