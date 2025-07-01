// src/locations/dto/create-location.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsMongoId,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationType } from '../entities/location.entity';

class CoordinatesDto {
  @IsNumber()
  @IsNotEmpty()
  lat: number; // Debe ser lat

  @IsNumber()
  @IsNotEmpty()
  lng: number; // Debe ser lng
}

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(LocationType)
  type: LocationType;

  @IsOptional()
  @IsMongoId()
  parentLocation?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}
