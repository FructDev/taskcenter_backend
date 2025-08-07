import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';
export class ConsolidateFindingsDto {
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  findingIds: string[];
}
