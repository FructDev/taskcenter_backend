/* eslint-disable @typescript-eslint/require-await */
// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ContractorsModule } from './contractors/contractors.module';
import { LocationsModule } from './locations/locations.module';
import { ReportsModule } from './reports/reports.module';
import { TaskTemplatesModule } from './task-templates/task-templates.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { EquipmentModule } from './equipment/equipment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduledTasksModule } from './scheduled-tasks/scheduled-tasks.module';

@Module({
  imports: [
    // 1. Carga de la configuración (variables de entorno)
    //    isGlobal: true hace que el ConfigModule esté disponible en toda la app.
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Conexión a la base de datos MongoDB
    //    Usamos forRootAsync para poder inyectar ConfigService y leer la DATABASE_URL.
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
    }),

    TasksModule,

    CloudinaryModule,

    UsersModule,

    AuthModule,

    ContractorsModule,

    LocationsModule,

    ReportsModule,

    TaskTemplatesModule,

    ActivityLogModule,

    EquipmentModule,

    ScheduleModule.forRoot(),

    ScheduledTasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
