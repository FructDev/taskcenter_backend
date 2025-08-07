import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
export class CreateFindingDto {
  @IsMongoId()
  @IsNotEmpty()
  equipmentId: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
