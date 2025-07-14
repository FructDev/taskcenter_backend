// src/reports/dto/filter-report.dto.ts
import {
  IsOptional,
  //   IsString,
  IsEnum,
  IsDateString,
  IsMongoId,
} from 'class-validator';
import {
  CriticalityLevel,
  TaskStatus,
  TaskType,
} from 'src/tasks/entities/task.entity';

export class FilterReportDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(CriticalityLevel)
  criticality?: CriticalityLevel;

  @IsOptional()
  @IsEnum(TaskType)
  taskType?: TaskType;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @IsOptional()
  @IsMongoId()
  equipmentId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
