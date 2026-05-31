// src/tasks/dto/filter-task.dto.ts

import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  TaskStatus,
  CriticalityLevel,
  TaskType,
} from '../entities/task.entity';

export class FilterTaskDto {
  @IsOptional()
  @IsString()
  search?: string;

  // Acepta un solo valor ("pendiente") o múltiples (?status=pendiente&status=en+progreso)
  @IsOptional()
  @Transform(
    ({ value }: { value: unknown }): TaskStatus[] =>
      (Array.isArray(value) ? value : [value]) as TaskStatus[],
  )
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  status?: TaskStatus | TaskStatus[];

  @IsOptional()
  @IsEnum(CriticalityLevel)
  criticality?: CriticalityLevel;

  @IsOptional()
  @IsEnum(TaskType)
  taskType?: TaskType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
