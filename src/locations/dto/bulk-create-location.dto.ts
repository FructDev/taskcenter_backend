import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsMongoId,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { LocationType } from '../entities/location.entity';

export class BulkCreateLocationDto {
  @IsEnum(LocationType)
  @IsNotEmpty()
  type: LocationType;

  @IsMongoId()
  @IsOptional()
  parentLocationId?: string;

  @IsInt()
  @Min(1)
  @Max(200)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  namePrefix: string;

  @IsString()
  @IsNotEmpty()
  codePrefix: string;

  @IsInt()
  @Min(1)
  startNumber: number;
}
