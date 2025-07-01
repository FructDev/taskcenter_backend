import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsMongoId,
  IsDateString,
} from 'class-validator';
import { EquipmentType } from '../entities/equipment.entity';

export class CreateEquipmentDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
  @IsEnum(EquipmentType) type: EquipmentType;
  @IsMongoId() @IsNotEmpty() location: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsDateString() installationDate?: Date;
}
