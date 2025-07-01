// src/activity-log/entities/activity-log.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { Task } from 'src/tasks/entities/task.entity';

export enum ActionType {
  // --- Tareas ---
  TASK_CREATED = 'TAREA_CREADA',
  TASK_UPDATED = 'TAREA_MODIFICADA',
  TASK_DELETED = 'TAREA_ELIMINADA',
  TASK_STATUS_CHANGED = 'CAMBIO_ESTADO_TAREA',
  TASK_ASSIGNED = 'TAREA_ASIGNADA',
  COMMENT_ADDED = 'COMENTARIO_AÑADIDO',
  ATTACHMENT_ADDED = 'ADJUNTO_AÑADIDO',

  // --- Usuarios ---
  USER_CREATED = 'USUARIO_CREADO',
  USER_UPDATED = 'USUARIO_MODIFICADO',
  USER_DELETED = 'USUARIO_ELIMINADO',

  // --- Contratistas ---
  CONTRACTOR_CREATED = 'CONTRATISTA_CREADO',
  CONTRACTOR_UPDATED = 'CONTRATISTA_MODIFICADO',
  CONTRACTOR_DELETED = 'CONTRATISTA_ELIMINADO',

  // --- Ubicaciones ---
  LOCATION_CREATED = 'UBICACION_CREADA',
  LOCATION_UPDATED = 'UBICACION_MODIFICADA',
  LOCATION_DELETED = 'UBICACION_ELIMINADA',

  // --- Plantillas ---
  TEMPLATE_CREATED = 'PLANTILLA_CREADA',
  TEMPLATE_UPDATED = 'PLANTILLA_MODIFICADA',
  TEMPLATE_DELETED = 'PLANTILLA_ELIMINADA',

  // --- Autenticación ---
  USER_LOGIN_SUCCESS = 'INICIO_SESION_EXITOSO',
  USER_LOGIN_FAILED = 'INICIO_SESION_FALLIDO',
}

@Schema({ timestamps: true })
export class ActivityLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User; // Quién realizó la acción

  @Prop({ required: true, enum: Object.values(ActionType) })
  action: ActionType; // Qué tipo de acción fue

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Task' })
  task?: Task; // La tarea afectada (si aplica)

  @Prop({ type: String })
  details?: string; // Un texto descriptivo, ej. "Cambió el estado a 'completada'"
}

export type ActivityLogDocument = HydratedDocument<ActivityLog>;
export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
