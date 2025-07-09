// src/tasks/dto/create-daily-log.dto.ts
import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';

export class CreateDailyLogDto {
  @IsMongoId()
  @IsNotEmpty()
  locationId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
