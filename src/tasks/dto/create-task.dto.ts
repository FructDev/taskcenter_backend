// src/tasks/dto/create-task.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  IsMongoId,
  IsArray,
} from 'class-validator';
import {
  CriticalityLevel,
  TaskStatus,
  TaskType,
} from '../entities/task.entity';

export class CreateTaskDto {
  @IsString({ message: 'El título debe ser un texto' })
  @IsNotEmpty({ message: 'El título no puede estar vacío' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  description: string;

  @IsEnum(CriticalityLevel, {
    message: `La criticidad debe ser uno de los siguientes valores: ${Object.values(
      CriticalityLevel,
    ).join(', ')}`,
  })
  criticality: CriticalityLevel;

  @IsEnum(TaskType, {
    message: `El tipo de tarea debe ser uno de los siguientes valores: ${Object.values(
      TaskType,
    ).join(', ')}`,
  })
  taskType: TaskType;

  // El estado es opcional al crear, ya que el Schema tiene un valor por defecto ('pendiente')
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: `El estado debe ser uno de los siguientes valores: ${Object.values(
      TaskStatus,
    ).join(', ')}`,
  })
  status?: TaskStatus;

  // IsDateString valida que la fecha venga en un formato estándar ISO 8601
  @IsDateString(
    {},
    { message: 'La fecha de vencimiento debe ser una fecha válida' },
  )
  dueDate: string;

  @IsOptional()
  @IsString()
  equipmentAffected?: string;

  @IsOptional()
  @IsMongoId({ message: 'El ID del técnico asignado no es válido' })
  assignedTo?: string;

  @IsOptional()
  @IsMongoId()
  equipment?: string;

  @IsOptional()
  @IsMongoId({ message: 'El ID del contratista asociado no es válido' })
  contractorAssociated?: string;

  @IsOptional()
  @IsString()
  contractorContactName?: string;

  @IsOptional()
  @IsString()
  contractorContactPhone?: string;

  @IsOptional()
  @IsString()
  contractorNotes?: string;

  @IsMongoId({ message: 'El ID de la ubicación no es válido' })
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  requiredPpe?: string[];
}
