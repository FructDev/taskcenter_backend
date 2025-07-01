// src/tasks/dto/status-change.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';
export class StatusChangeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  reason: string;
}
