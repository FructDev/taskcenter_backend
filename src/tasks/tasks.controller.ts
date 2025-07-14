import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { StatusChangeDto } from './dto/status-change.dto';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PLANIFICADOR,
    UserRole.TECNICO,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    // Pasamos el usuario autenticado al servicio
    return this.tasksService.create(createTaskDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary') // La nueva ruta será /tasks/summary
  getSummary() {
    return this.tasksService.getSummary();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard) // Solo usuarios logueados pueden ver sus tareas
  findMyTasks(@Req() req) {
    // Obtenemos el ID del usuario del token que JwtAuthGuard ya validó
    const userId = req.user.id;
    return this.tasksService.findTasksByUserId(userId);
  }
  // --- NUEVA IMPLEMENTACIÓN ---
  // Este método maneja las peticiones GET a /tasks
  @UseGuards(JwtAuthGuard)
  @Get()
  // Usamos @Query() para capturar todos los query params de la URL.
  // Al tiparlo con nuestro DTO (FilterTaskDto), NestJS y el ValidationPipe
  // validarán automáticamente los parámetros por nosotros.
  findAll(@Query() filterDto: FilterTaskDto) {
    return this.tasksService.findAll(filterDto);
  }

  // --- NUEVA IMPLEMENTACIÓN ---
  // Este método maneja las peticiones GET a /tasks/:id
  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Añadimos protección aquí también
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PLANIFICADOR,
    UserRole.TECNICO,
  )
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req,
  ) {
    // Pasamos el usuario autenticado al servicio
    return this.tasksService.update(id, updateTaskDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // <-- FORMA CORRECTA DE COMBINAR
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PLANIFICADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseMongoIdPipe) id: string, @Req() req) {
    return this.tasksService.remove(id, req.user);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  startTask(@Param('id', ParseMongoIdPipe) id: string, @Req() req) {
    // <-- CORRECCIÓN
    return this.tasksService.startTask(id, req.user);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard) // Usamos ambos guards
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PLANIFICADOR,
    UserRole.TECNICO,
  ) // Definimos roles permitidos
  completeTask(@Param('id', ParseMongoIdPipe) id: string, @Req() req) {
    return this.tasksService.completeTask(id, req.user);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  addComment(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req, // Obtenemos el request para saber quién es el usuario
  ) {
    return this.tasksService.addComment(id, createCommentDto, req.user);
  }

  @Post(':id/attachments')
  @UseGuards(JwtAuthGuard) // Solo usuarios logueados
  @UseInterceptors(FileInterceptor('file'))
  addAttachment(
    @Param('id', ParseMongoIdPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })], // Límite de 5MB
      }),
    )
    file: Express.Multer.File,
    @Req() req,
  ) {
    return this.tasksService.addAttachment(id, file, req.user);
  }

  @Get('by-equipment/:equipmentId')
  findTasksByEquipment(
    @Param('equipmentId', ParseMongoIdPipe) equipmentId: string,
  ) {
    return this.tasksService.findTasksByEquipmentId(equipmentId);
  }

  @Post(':id/pause')
  @UseGuards(JwtAuthGuard)
  pauseTask(
    @Param('id', ParseMongoIdPipe) id: string,
    @Req() req,
    @Body() statusChangeDto: StatusChangeDto,
  ) {
    return this.tasksService.pause(id, req.user, statusChangeDto);
  }

  @Post(':id/resume')
  @UseGuards(JwtAuthGuard)
  resumeTask(@Param('id', ParseMongoIdPipe) id: string, @Req() req) {
    return this.tasksService.resume(id, req.user);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelTask(
    @Param('id', ParseMongoIdPipe) id: string,
    @Req() req,
    @Body() statusChangeDto: StatusChangeDto,
  ) {
    return this.tasksService.cancel(id, req.user, statusChangeDto);
  }

  @Post(':id/daily-log')
  @UseGuards(JwtAuthGuard)
  addDailyLog(
    @Param('id', ParseMongoIdPipe) id: string,
    @Req() req,
    @Body() createDailyLogDto: CreateDailyLogDto,
  ) {
    return this.tasksService.addDailyLog(id, req.user, createDailyLogDto);
  }
}
