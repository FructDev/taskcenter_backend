// src/reports/reports.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PLANIFICADOR)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('tasks-by-status')
  getTasksByStatus() {
    return this.reportsService.getTasksByStatus();
  }

  // --- NUEVO ENDPOINT ---
  @Get('tasks-by-criticality')
  getTasksByCriticality() {
    return this.reportsService.getTasksByCriticality();
  }

  // --- NUEVO ENDPOINT ---
  @Get('tasks-by-type')
  getTasksByType() {
    return this.reportsService.getTasksByType();
  }

  // --- NUEVO ENDPOINT ---
  @Get('average-resolution-time')
  getAverageResolutionTime() {
    return this.reportsService.getAverageResolutionTime();
  }

  @Get('avg-time-by-criticality')
  getAverageTimeByCriticality() {
    // Usamos nuestro nuevo método genérico, pasándole el campo por el que agrupar
    return this.reportsService.getAverageTimeByGroup('criticality');
  }

  @Get('avg-time-by-type')
  getAverageTimeByType() {
    return this.reportsService.getAverageTimeByGroup('taskType');
  }
}
