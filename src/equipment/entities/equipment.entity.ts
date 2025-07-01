import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  Location,
  LocationDocument,
} from 'src/locations/entities/location.entity';

export enum EquipmentType {
  INVERSOR = 'inversor',
  SCB = 'scb',
  STRING = 'string',
  PANEL = 'panel',
  WEATHER_STATION = 'weather_station',
  SUBESTACION = 'subestacion',
  TRANSFORMADOR = 'transformador',
  TRACKER = 'tracker', // <-- Nuevo
  GENERADOR_EMERGENCIA = 'generador_emergencia', // <-- Nuevo
  GENERADOR_5KV = 'generador_5kv', // <-- Nuevo
  CELDA = 'celda', // <-- Nuevo
  CT = 'ct', // <-- Nuevo
  PT = 'pt', // <-- Nuevo
  SECCIONADOR = 'seccionador', // <-- Nuevo
  TRANSFORMADOR_AUXILIAR = 'transformador_auxiliar', // <-- Nuevo
  SKID = 'skid', // <-- Nuevo
  OTRO = 'otro',
}
@Schema({ timestamps: true })
export class Equipment {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  code: string;

  @Prop({ required: true, enum: Object.values(EquipmentType) })
  type: EquipmentType;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  })
  location: LocationDocument;

  @Prop({ required: false, trim: true })
  brand?: string;

  @Prop({ required: false, trim: true })
  model?: string;

  @Prop({ type: Date, required: false })
  installationDate?: Date;
}

export type EquipmentDocument = HydratedDocument<Equipment>;
export const EquipmentSchema = SchemaFactory.createForClass(Equipment);
