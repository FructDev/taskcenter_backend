// src/task-templates/task-templates.module.ts

import { Module } from '@nestjs/common';
import { TaskTemplatesService } from './task-templates.service';
import { TaskTemplatesController } from './task-templates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TaskTemplate,
  TaskTemplateSchema,
} from './entities/task-template.entity';

@Module({
  // ESTA ES LA SECCIÓN QUE FALTABA
  imports: [
    MongooseModule.forFeature([
      { name: TaskTemplate.name, schema: TaskTemplateSchema },
    ]),
  ],
  controllers: [TaskTemplatesController],
  providers: [TaskTemplatesService],
})
export class TaskTemplatesModule {}
