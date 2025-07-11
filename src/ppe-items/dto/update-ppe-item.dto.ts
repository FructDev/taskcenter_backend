import { PartialType } from '@nestjs/mapped-types';
import { CreatePpeItemDto } from './create-ppe-item.dto';

export class UpdatePpeItemDto extends PartialType(CreatePpeItemDto) {}
