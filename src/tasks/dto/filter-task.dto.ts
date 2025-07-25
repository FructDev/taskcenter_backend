// src/tasks/dto/filter-task.dto.ts

import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  TaskStatus,
  CriticalityLevel,
  TaskType,
} from '../entities/task.entity';

export class FilterTaskDto {
  // Todos los campos son opcionales, ya que el usuario puede no querer filtrar por ellos.
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(CriticalityLevel)
  criticality?: CriticalityLevel;

  @IsOptional()
  @IsEnum(TaskType)
  taskType?: TaskType;

  // Podríamos añadir más filtros aquí en el futuro, como búsqueda por texto.
}
