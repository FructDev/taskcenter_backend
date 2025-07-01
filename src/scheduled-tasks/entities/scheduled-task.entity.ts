// src/scheduled-tasks/entities/scheduled-task.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { TaskTemplate } from 'src/task-templates/entities/task-template.entity';
import { EquipmentType } from 'src/equipment/entities/equipment.entity';

@Schema({ timestamps: true })
export class ScheduledTask {
  @Prop({ required: true, trim: true })
  name: string; // Ej: "Inspección mensual de Inversores"

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskTemplate',
    required: true,
  })
  taskTemplate: TaskTemplate; // Qué plantilla usar

  // Cron string (ej. "0 0 1 * *" para el 1ro de cada mes)
  @Prop({ required: true })
  schedule: string;

  @Prop({ required: true, enum: Object.values(EquipmentType) })
  targetEquipmentType: EquipmentType; // A qué tipo de equipo aplicar la regla

  @Prop({ type: Date })
  lastRunAt?: Date;

  @Prop({ type: Boolean, default: true })
  isEnabled: boolean;
}

export type ScheduledTaskDocument = HydratedDocument<ScheduledTask>;
export const ScheduledTaskSchema = SchemaFactory.createForClass(ScheduledTask);
