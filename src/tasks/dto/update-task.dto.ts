// src/tasks/dto/update-task.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
