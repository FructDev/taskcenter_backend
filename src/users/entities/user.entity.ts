// src/users/entities/user.entity.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Definimos los roles de usuario para mantener la consistencia
export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  PLANIFICADOR = 'planificador',
  TECNICO = 'tecnico',
  EHS = 'ehs',
  SEGURIDAD_PATRIMONIAL = 'seguridad_patrimonial',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true, // El email debe ser único para cada usuario
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false, // <-- La opción va DENTRO de las llaves del decorador
  })
  password: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: false, trim: true })
  photoUrl?: string;

  @Prop({ required: true, trim: true })
  department: string;

  @Prop({
    required: true,
    enum: Object.values(UserRole),
    default: UserRole.TECNICO,
  })
  role: UserRole;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.methods.toJSON = function (this: UserDocument) {
  // Usamos desestructuración para omitir las propiedades que no queremos
  const { __v, password, ...userObject } = this.toObject();
  return userObject;
};
