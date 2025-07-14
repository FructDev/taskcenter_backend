// src/scheduled-tasks/scheduled-tasks.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { CreateScheduledTaskDto } from './dto/create-scheduled-task.dto';
import { UpdateScheduledTaskDto } from './dto/update-scheduled-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id/parse-mongo-id.pipe';

@Controller('scheduled-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PLANIFICADOR) // Toda la gestión es solo para roles altos
export class ScheduledTasksController {
  constructor(private readonly scheduledTasksService: ScheduledTasksService) {}

  @Post()
  create(@Body() createScheduledTaskDto: CreateScheduledTaskDto) {
    return this.scheduledTasksService.create(createScheduledTaskDto);
  }

  @Get()
  findAll() {
    return this.scheduledTasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.scheduledTasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateScheduledTaskDto: UpdateScheduledTaskDto,
  ) {
    return this.scheduledTasksService.update(id, updateScheduledTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.scheduledTasksService.remove(id);
  }

  @Patch(':id/toggle')
  toggleStatus(@Param('id', ParseMongoIdPipe) id: string) {
    return this.scheduledTasksService.toggleStatus(id);
  }

  // --- NUEVO ENDPOINT PARA FORZAR EJECUCIÓN ---
  @Post(':id/run-now')
  runNow(@Param('id', ParseMongoIdPipe) id: string) {
    return this.scheduledTasksService.runRuleNow(id);
  }
}
