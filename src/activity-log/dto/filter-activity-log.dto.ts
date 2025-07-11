// src/activity-log/dto/filter-activity-log.dto.ts
import { IsOptional, IsMongoId, IsEnum, IsDateString } from 'class-validator';
import { ActionType } from '../entities/activity-log.entity';

export class FilterActivityLogDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsMongoId()
  taskId?: string;

  @IsOptional()
  @IsEnum(ActionType)
  action?: ActionType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
