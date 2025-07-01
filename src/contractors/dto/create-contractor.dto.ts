// src/contractors/dto/create-contractor.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateContractorDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  contactInfo: string;

  @IsString()
  @IsNotEmpty()
  specialty: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsUrl({}, { message: 'El formato de la URL de la foto no es válido' })
  photoUrl?: string;
}
