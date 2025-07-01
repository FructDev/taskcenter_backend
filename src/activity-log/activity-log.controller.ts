// src/activity-log/activity-log.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('activity-log')
@UseGuards(JwtAuthGuard) // Protegido para usuarios logueados
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  findAll() {
    return this.activityLogService.findAll();
  }
}
