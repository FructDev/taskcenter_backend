import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsMongoId,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { EquipmentType } from 'src/equipment/entities/equipment.entity';

export class CreateScheduledTaskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsNotEmpty()
  taskTemplate: string;

  @IsString()
  @IsNotEmpty()
  // Podríamos añadir validación de cron expression aquí con una librería
  schedule: string;

  @IsEnum(EquipmentType)
  targetEquipmentType: EquipmentType;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
