// src/equipment/dto/bulk-create-equipment.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsMongoId,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { EquipmentType } from '../entities/equipment.entity';

export class BulkCreateEquipmentDto {
  @IsEnum(EquipmentType)
  @IsNotEmpty()
  type: EquipmentType; // Ej: 'scb', 'tracker'

  @IsMongoId()
  @IsNotEmpty()
  parentLocationId: string; // El ID del Inversor o Fila al que pertenecen

  @IsInt()
  @Min(1)
  @Max(100) // Límite de seguridad para no crear demasiados de golpe
  quantity: number; // Ej: 18

  @IsString()
  @IsNotEmpty()
  namePrefix: string; // Ej: "SCB Inversor 1.1"

  @IsString()
  @IsNotEmpty()
  codePrefix: string; // Ej: "SCB-011"

  @IsInt()
  @Min(1)
  startNumber: number; // Ej: 1
}
