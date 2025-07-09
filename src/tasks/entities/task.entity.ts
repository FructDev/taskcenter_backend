// src/tasks/entities/task.entity.ts
import { Location } from 'src/locations/entities/location.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { Contractor } from 'src/contractors/entities/contractor.entity';
import { User } from 'src/users/entities/user.entity';
import { Equipment } from 'src/equipment/entities/equipment.entity';

// --- Enums para mantener la consistencia de los datos ---

export enum CriticalityLevel {
  ALTA = 'alta',
  MEDIA = 'media',
  BAJA = 'baja',
}

export enum TaskType {
  PREVENTIVO = 'mantenimiento preventivo',
  CORRECTIVO = 'mantenimiento correctivo',
  INSPECCION = 'inspeccion',
  OTRO = 'otro',
}

export enum TaskStatus {
  PENDIENTE = 'pendiente',
  EN_PROGRESO = 'en progreso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  PAUSADA = 'pausada', // <-- Añadir
}

@Schema({ _id: false, timestamps: true })
class DailyLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  confirmedBy: User;

  @Prop({ required: true })
  notes: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  })
  location: Location;

  createdAt: Date;
}
export const DailyLogSchema = SchemaFactory.createForClass(DailyLog);

@Schema({ _id: false, timestamps: true })
class StatusChange {
  @Prop({ required: true })
  from: string;
  @Prop({ required: true })
  to: string;
  @Prop({ required: true })
  reason: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  userId: mongoose.Schema.Types.ObjectId;
}
const StatusChangeSchema = SchemaFactory.createForClass(StatusChange);

// --- Schema del Subdocumento de Comentarios ---
@Schema({ timestamps: true })
export class Comment {
  // <-- YA NO HEREDA de Document
  @Prop({ required: true })
  text: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  author: User;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

// --- Schema Principal de la Tarea ---
@Schema({ timestamps: true })
export class Task {
  // <-- YA NO HEREDA de Document
  @Prop({ required: true, trim: true })
  title: string;

  // ... todos los demás campos de Task como estaban ...
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({
    required: true,
    enum: Object.values(CriticalityLevel),
    default: CriticalityLevel.BAJA,
  })
  criticality: CriticalityLevel;

  @Prop({ required: true, enum: Object.values(TaskType) })
  taskType: TaskType;

  @Prop({
    required: true,
    enum: Object.values(TaskStatus),
    default: TaskStatus.PENDIENTE,
  })
  status: TaskStatus;

  @Prop({ trim: true })
  equipmentAffected: string;

  @Prop({ type: Date, required: true })
  dueDate: Date;

  @Prop([String])
  attachments: string[];

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[]; // El tipo es ahora la clase limpia Comment

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  assignedTo?: User; // ...el tipo en la práctica será UserDocument.

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contractor',
    required: false,
  })
  contractorAssociated?: Contractor; // El ID de la empresa del directorio

  @Prop({ trim: true, required: false })
  contractorContactName?: string; // Nombre del jefe de equipo o contacto

  @Prop({ trim: true, required: false })
  contractorContactPhone?: string; // Teléfono de contacto para esta tarea

  @Prop({ trim: true, required: false })
  contractorNotes?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  })
  location: Location;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: false,
  })
  equipment?: Equipment; // Reemplaza el antiguo 'equipmentAffected'

  @Prop({ type: [StatusChangeSchema], default: [] })
  statusHistory: StatusChange[];

  @Prop({ type: [DailyLogSchema], default: [] })
  dailyLogs: DailyLog[];
}

// Exportamos el tipo de Documento de Mongoose por separado
export type TaskDocument = HydratedDocument<Task>;
export const TaskSchema = SchemaFactory.createForClass(Task);

// Índices (sin cambios)
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ criticality: 1 });
