// src/task-templates/entities/task-template.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CriticalityLevel, TaskType } from 'src/tasks/entities/task.entity';
import { Location } from 'src/locations/entities/location.entity';

@Schema({ timestamps: true })
export class TaskTemplate {
  @Prop({ required: true, unique: true, trim: true })
  name: string; // Nombre de la plantilla, ej: "Inspección Mensual de Inversor"

  @Prop({ required: true, trim: true })
  title: string; // Título predefinido para la tarea

  @Prop({ required: true, trim: true })
  description: string; // Descripción estándar de la tarea

  @Prop({ required: true, enum: Object.values(TaskType) })
  taskType: TaskType;

  @Prop({ required: true, enum: Object.values(CriticalityLevel) })
  criticality: CriticalityLevel;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: false,
  })
  location?: Location;
}

export type TaskTemplateDocument = HydratedDocument<TaskTemplate>;
export const TaskTemplateSchema = SchemaFactory.createForClass(TaskTemplate);
