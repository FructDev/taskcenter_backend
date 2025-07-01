// src/task-templates/dto/create-task-template.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { CriticalityLevel, TaskType } from 'src/tasks/entities/task.entity';

export class CreateTaskTemplateDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;
  @IsEnum(TaskType) taskType: TaskType;
  @IsEnum(CriticalityLevel) criticality: CriticalityLevel;
  @IsOptional()
  @IsMongoId()
  location?: string;
}
