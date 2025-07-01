// src/task-templates/task-templates.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TaskTemplatesService } from './task-templates.service';
import { CreateTaskTemplateDto } from './dto/create-task-template.dto';
import { UpdateTaskTemplateDto } from './dto/update-task-template.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id/parse-mongo-id.pipe';

@Controller('task-templates')
@UseGuards(JwtAuthGuard) // Todas las rutas requieren autenticación
export class TaskTemplatesController {
  constructor(private readonly taskTemplatesService: TaskTemplatesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR) // Solo roles altos crean
  @UseGuards(RolesGuard)
  create(@Body() createTaskTemplateDto: CreateTaskTemplateDto) {
    return this.taskTemplatesService.create(createTaskTemplateDto);
  }

  @Get() // Todos los usuarios autenticados pueden leer las plantillas
  findAll() {
    return this.taskTemplatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.taskTemplatesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @UseGuards(RolesGuard)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateTaskTemplateDto: UpdateTaskTemplateDto,
  ) {
    return this.taskTemplatesService.update(id, updateTaskTemplateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.taskTemplatesService.remove(id);
  }
}
