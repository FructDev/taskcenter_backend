// src/tasks/dto/complete-task.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FailureMode } from '../entities/task.entity';

class FailureReportDto {
  @IsEnum(FailureMode)
  @IsNotEmpty()
  failureMode: FailureMode;

  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @IsString()
  @IsNotEmpty()
  correctiveAction: string;
}

export class CompleteTaskDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FailureReportDto)
  failureReport?: FailureReportDto;
}
