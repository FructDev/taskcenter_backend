import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePpeItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
