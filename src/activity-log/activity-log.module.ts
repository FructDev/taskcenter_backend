// src/activity-log/activity-log.module.ts
import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLog, ActivityLogSchema } from './entities/activity-log.entity';
import { ActivityLogController } from './activity-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivityLog.name, schema: ActivityLogSchema },
    ]),
  ],
  providers: [ActivityLogService],
  exports: [ActivityLogService],
  controllers: [ActivityLogController], // Exportamos para que otros módulos puedan usarlo
})
export class ActivityLogModule {}
