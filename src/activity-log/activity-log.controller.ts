// src/activity-log/activity-log.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FilterActivityLogDto } from './dto/filter-activity-log.dto';

@Controller('activity-log')
@UseGuards(JwtAuthGuard) // Protegido para usuarios logueados
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  findAll(@Query() filters: FilterActivityLogDto) {
    return this.activityLogService.findAll(filters);
  }
}
