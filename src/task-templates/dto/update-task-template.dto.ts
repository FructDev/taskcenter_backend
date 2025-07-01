// src/task-templates/dto/update-task-template.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskTemplateDto } from './create-task-template.dto';

export class UpdateTaskTemplateDto extends PartialType(CreateTaskTemplateDto) {}
