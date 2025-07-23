// src/tasks/tasks.module.ts

import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './entities/task.entity';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { ContractorsModule } from 'src/contractors/contractors.module';
import { UsersModule } from 'src/users/users.module';
import { LocationsModule } from 'src/locations/locations.module';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { EquipmentModule } from 'src/equipment/equipment.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  // Añade esta sección de imports
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    CloudinaryModule,
    UsersModule,
    ContractorsModule,
    LocationsModule,
    ActivityLogModule,
    EquipmentModule,
    NotificationsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
