import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class PpeItem {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: false, trim: true })
  description?: string;
}

export type PpeItemDocument = HydratedDocument<PpeItem>;
export const PpeItemSchema = SchemaFactory.createForClass(PpeItem);
