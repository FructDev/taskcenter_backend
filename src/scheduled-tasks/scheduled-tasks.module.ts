// src/scheduled-tasks/scheduled-tasks.module.ts

import { Module } from '@nestjs/common';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { ScheduledTasksController } from './scheduled-tasks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ScheduledTask,
  ScheduledTaskSchema,
} from './entities/scheduled-task.entity';
import { TasksModule } from 'src/tasks/tasks.module';
import { EquipmentModule } from 'src/equipment/equipment.module';

@Module({
  imports: [
    // 1. Registramos el schema de este módulo
    MongooseModule.forFeature([
      { name: ScheduledTask.name, schema: ScheduledTaskSchema },
    ]),
    // 2. Importamos los módulos de los que nuestro servicio depende
    TasksModule,
    EquipmentModule,
  ],
  controllers: [ScheduledTasksController],
  providers: [ScheduledTasksService],
})
export class ScheduledTasksModule {}
