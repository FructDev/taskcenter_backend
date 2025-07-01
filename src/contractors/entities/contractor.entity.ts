// src/contractors/entities/contractor.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Contractor {
  @Prop({ required: true, unique: true, trim: true })
  companyName: string;

  @Prop({ required: true, trim: true })
  contactInfo: string; // Puede ser un email, teléfono, etc.

  @Prop({ required: true, trim: true })
  specialty: string; // ej. "Paneles Solares", "Inversores", "Limpieza"

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: false, trim: true })
  photoUrl?: string;
}

export type ContractorDocument = HydratedDocument<Contractor>;
export const ContractorSchema = SchemaFactory.createForClass(Contractor);
