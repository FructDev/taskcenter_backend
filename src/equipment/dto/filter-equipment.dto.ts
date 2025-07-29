// src/equipment/dto/filter-equipment.dto.ts
import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EquipmentType } from '../entities/equipment.entity';

export class FilterEquipmentDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Transforma el string de la URL a número
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(EquipmentType)
  type?: EquipmentType;
}
