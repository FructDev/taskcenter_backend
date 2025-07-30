// src/tasks/tasks.service.ts

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterTaskDto } from './dto/filter-task.dto';
import { FilterQuery, Model } from 'mongoose';
import { Task, TaskStatus, TaskType } from './entities/task.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { UsersService } from 'src/users/users.service';
import { ContractorsService } from 'src/contractors/contractors.service';
import { UserDocument, UserRole } from 'src/users/entities/user.entity';
import { LocationsService } from 'src/locations/locations.service';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { ActionType } from 'src/activity-log/entities/activity-log.entity';
import { EquipmentService } from 'src/equipment/equipment.service';
import { StatusChangeDto } from './dto/status-change.dto';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CompleteTaskDto } from './dto/complete-task.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly relationsToPopulate = [
    'location',
    'assignedTo',
    'contractorAssociated',
    'comments.author',
    'equipment',
    'requiredPpe',
  ];
  // Inyectamos el modelo de Mongoose para poder interactuar con la colección 'tasks'
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    private cloudinaryService: CloudinaryService,
    private usersService: UsersService,
    private contractorsService: ContractorsService,
    private locationsService: LocationsService,
    private activityLogService: ActivityLogService,
    private equipmentService: EquipmentService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // El método 'create' recibe el DTO validado desde el controlador
  async create(createTaskDto: CreateTaskDto, currentUser: UserDocument | null) {
    const { assignedTo, contractorAssociated, location, equipment } =
      createTaskDto;

    await this.locationsService.findOne(location);

    if (currentUser) {
      const userRole = currentUser.role;

      if (userRole === UserRole.TECNICO) {
        // Un técnico puede crear una tarea sin asignarla a un usuario (si es para un contratista)
        // O puede asignársela a sí mismo, pero no a otro técnico.
        if (
          assignedTo &&
          assignedTo.toString() !== currentUser._id.toString()
        ) {
          throw new ForbiddenException(
            'Un técnico solo puede crear tareas para sí mismo o para un contratista.',
          );
        }
        // Si el técnico no se asigna a sí mismo ni a un contratista, se auto-asigna por defecto.
        if (!assignedTo && !contractorAssociated) {
          createTaskDto.assignedTo = currentUser._id.toString();
        }
      } else if (
        userRole === UserRole.EHS ||
        userRole === UserRole.SEGURIDAD_PATRIMONIAL
      ) {
        if (assignedTo) {
          const userToAssign = await this.usersService.findOne(assignedTo);
          const allowedRoles: UserRole[] = [
            UserRole.PLANIFICADOR,
            UserRole.SUPERVISOR,
          ];
          if (!allowedRoles.includes(userToAssign.role)) {
            throw new ForbiddenException(
              'Este rol solo puede asignar tareas a Planificadores o Supervisores.',
            );
          }
        }
      }
    }

    // --- LÓGICA DE VALIDACIÓN DE RELACIONES ---
    if (assignedTo) {
      // Si nos pasan un ID de usuario, verificamos que exista.
      // findOne ya lanza un 404 Not Found si no lo encuentra.
      await this.usersService.findOne(assignedTo);
    }
    if (contractorAssociated) {
      // Lo mismo para el contratista
      await this.contractorsService.findOne(contractorAssociated);
    }

    if (equipment) {
      // Añadir esta validación
      await this.equipmentService.findOne(equipment);
    }

    const createdTask = new this.taskModel(createTaskDto);
    const savedTask = await createdTask.save(); // Guardamos el resultado

    // --- AÑADIR ESTE LOG ---
    if (currentUser) {
      await this.activityLogService.createLog({
        user: currentUser,
        action: ActionType.TASK_CREATED,
        taskId: savedTask._id.toString(),
        details: `Creó la tarea "${savedTask.title}"`,
      });
    }

    if (savedTask.assignedTo) {
      // Si la tarea tiene un 'assignedTo', ya sabemos que es un ID válido.
      // Simplemente lo convertimos a string.
      await this.notificationsService.sendNotificationToUser(
        savedTask.assignedTo._id.toString(),
        'Nueva Tarea Asignada',
        `Se ha creado la tarea: "${savedTask.title}"`,
      );
    }

    return savedTask.populate(this.relationsToPopulate);
  }

  // --- NUEVA IMPLEMENTACIÓN ---
  findAll(filterDto: FilterTaskDto) {
    // Desestructuramos también 'search' del DTO
    const { status, criticality, taskType, search, startDate, endDate } =
      filterDto;
    // const { status, search, startDate, endDate } = filterDto;
    const filters: FilterQuery<Task> = { isArchived: { $ne: true } };

    if (status) {
      // Convierte el string 'pendiente,en progreso' en un array ['pendiente', 'en progreso']
      const statusArray = status.split(',');
      // Usa el operador $in de MongoDB para buscar documentos cuyo estado esté en el array
      filters.status = { $in: statusArray };
    }
    if (criticality) {
      filters.criticality = criticality;
    }
    if (taskType) {
      filters.taskType = taskType;
    }

    // --- LÓGICA DE BÚSQUEDA AÑADIDA ---
    if (search) {
      // Usamos una expresión regular ($regex) para buscar texto que contenga
      // el término de búsqueda, sin importar mayúsculas o minúsculas ($options: 'i').
      filters.title = { $regex: search, $options: 'i' };
    }

    if (startDate && endDate) {
      filters.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return this.taskModel
      .find(filters)
      .sort({ dueDate: 1 })
      .populate(this.relationsToPopulate)
      .exec();
  }

  // --- NUEVA IMPLEMENTACIÓN ---
  async findOne(id: string) {
    // findById es un método eficiente para buscar por ID.
    const task = await this.taskModel
      .findById(id)
      .populate(this.relationsToPopulate)
      .exec();

    // MANEJO DE ERRORES PROFESIONAL: Si no se encuentra la tarea, lanzamos una excepción.
    // NestJS la convertirá automáticamente en una respuesta 404 Not Found.
    if (!task) {
      throw new NotFoundException(`Tarea con ID "${id}" no encontrada`);
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    currentUser: UserDocument,
  ) {
    const { assignedTo, contractorAssociated, equipment } = updateTaskDto;

    const userRole = currentUser.role;

    if (userRole === UserRole.TECNICO) {
      if (assignedTo && assignedTo.toString() !== currentUser._id.toString()) {
        throw new ForbiddenException(
          'Un técnico solo puede asignarse tareas a sí mismo.',
        );
      }
    } else if (
      userRole === UserRole.EHS ||
      userRole === UserRole.SEGURIDAD_PATRIMONIAL
    ) {
      if (assignedTo) {
        const userToAssign = await this.usersService.findOne(assignedTo);
        const allowedRoles: UserRole[] = [
          UserRole.PLANIFICADOR,
          UserRole.SUPERVISOR,
        ];
        if (!allowedRoles.includes(userToAssign.role)) {
          throw new ForbiddenException(
            'Este rol solo puede asignar tareas a Planificadores o Supervisores.',
          );
        }
      }
    }

    // --- LÓGICA DE VALIDACIÓN DE RELACIONES (también en update) ---
    if (assignedTo) {
      await this.usersService.findOne(assignedTo);
    }
    if (contractorAssociated) {
      await this.contractorsService.findOne(contractorAssociated);
    }

    if (equipment) {
      // Añadir esta validación
      await this.equipmentService.findOne(equipment);
    }

    const originalTask = await this.findOne(id); // Necesitamos esto para comparar
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true })
      .populate(this.relationsToPopulate) // <-- Añadir populate
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Tarea con ID "${id}" no encontrada`);
    }
    const oldAssigneeId = originalTask.assignedTo?._id?.toString();
    const newAssigneeId = updatedTask.assignedTo?._id?.toString();

    if (oldAssigneeId !== newAssigneeId) {
      // Primero, registramos el cambio en la bitácora de actividad
      await this.activityLogService.createLog({
        user: currentUser,
        action: ActionType.TASK_ASSIGNED,
        taskId: updatedTask._id.toString(),
        details: `Reasignó la tarea a ${updatedTask.assignedTo?.name || updatedTask.contractorAssociated?.companyName}`,
      });

      // --- LÓGICA DE NOTIFICACIÓN AÑADIDA ---
      // Si el nuevo asignado es un usuario (y no un contratista), le enviamos la notificación
      if (updatedTask.assignedTo) {
        this.logger.log(
          `Intento de notificación para usuario: ${newAssigneeId}`,
        );
        await this.notificationsService.sendNotificationToUser(
          updatedTask.assignedTo._id.toString(),
          'Nueva Tarea Asignada',
          `Se te ha asignado la tarea: "${updatedTask.title}"`,
        );
      }
    } else {
      await this.activityLogService.createLog({
        user: currentUser,
        action: ActionType.TASK_UPDATED,
        taskId: updatedTask._id.toString(),
        details: `Editó los detalles de la tarea "${updatedTask.title}"`,
      });
    }
    return updatedTask;
  }

  async remove(id: string, currentUser: UserDocument) {
    const task = await this.findOne(id);
    if (!task) {
      throw new NotFoundException(`Tarea con ID "${id}" no encontrada.`);
    }

    task.isArchived = true;

    await this.activityLogService.createLog({
      user: currentUser,
      action: ActionType.TASK_DELETED, // La acción sigue siendo la misma para el log
      details: `Archivó la tarea "${task.title}"`,
    });

    const savedTask = await task.save();
    return savedTask;
  }

  async startTask(id: string, currentUser: UserDocument) {
    // Reutilizamos findOne para obtener la tarea y manejar el error 404 si no existe
    const task = await this.findOne(id);

    if (!task.assignedTo && !task.contractorAssociated) {
      throw new BadRequestException(
        'La tarea debe tener un responsable asignado para poder cambiar su estado.',
      );
    }

    // Lógica de negocio: Solo se puede iniciar una tarea si está 'pendiente'
    if (task.status !== TaskStatus.PENDIENTE) {
      throw new BadRequestException(
        `No se puede iniciar una tarea que ya está "${task.status}"`,
      );
    }

    task.status = TaskStatus.EN_PROGRESO;
    task.startedAt = new Date(); // Registramos la fecha de inicio

    await this.activityLogService.createLog({
      user: currentUser,
      action: ActionType.TASK_STATUS_CHANGED,
      taskId: task._id.toString(),
      details: `Cambió el estado a "en progreso"`,
    });

    return task.save();
  }

  async completeTask(
    id: string,
    currentUser: UserDocument,
    completeTaskDto: CompleteTaskDto,
  ) {
    const task = await this.findOne(id);
    if (task.status !== TaskStatus.EN_PROGRESO) {
      throw new BadRequestException(
        `No se puede completar una tarea que está "${task.status}"`,
      );
    }

    // Si es una tarea correctiva y se envía un reporte, lo guardamos
    if (
      task.taskType === TaskType.CORRECTIVO &&
      completeTaskDto.failureReport
    ) {
      task.failureReport = {
        failureMode: completeTaskDto.failureReport.failureMode,
        diagnosis: completeTaskDto.failureReport.diagnosis,
        correctiveAction: completeTaskDto.failureReport.correctiveAction,
      };
    }

    task.status = TaskStatus.COMPLETADA;
    task.completedAt = new Date();

    await this.activityLogService.createLog({
      user: currentUser,
      action: ActionType.TASK_STATUS_CHANGED,
      taskId: task._id.toString(),
      details: `Cambió el estado a "completada"`,
    });

    return task.save();
  }

  async addComment(
    id: string,
    createCommentDto: CreateCommentDto,
    currentUser: UserDocument,
  ) {
    // Reutilizamos findOne para obtener la tarea y manejar el 404 si no existe
    const task = await this.findOne(id);

    // Añadimos el nuevo comentario al array de comentarios de la tarea.
    const comment = {
      text: createCommentDto.text,
      author: currentUser._id, // Guardamos el ID del autor
    };
    // Mongoose se encargará de crear el sub-documento con su propio _id y timestamps.
    task.comments.push(comment as any);
    const savedTask = await task.save();

    await this.activityLogService.createLog({
      user: currentUser,
      action: ActionType.COMMENT_ADDED,
      taskId: savedTask._id.toString(),
      details: `Añadió un comentario.`,
    });
    // Guardamos la tarea principal, lo que también guardará el nuevo sub-documento.
    return savedTask.populate(this.relationsToPopulate);
  }

  async addAttachment(
    id: string,
    file: Express.Multer.File,
    currentUser: UserDocument,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo no fue proporcionado.');
    }

    const task = await this.findOne(id);

    const uploadResult = await this.cloudinaryService.uploadFile(file);

    // --- SOLUCIÓN DEFINITIVA CON TYPE GUARD EXPLÍCITO ---

    // Verificamos si la propiedad 'error' existe en el resultado.
    // El operador 'in' es un type guard reconocido por TypeScript.
    if ('error' in uploadResult) {
      // Si entramos aquí, TypeScript SABE que uploadResult es de tipo UploadApiErrorResponse.
      throw new InternalServerErrorException(
        `Error al subir el archivo a Cloudinary: ${uploadResult.error.message}`,
      );
    }

    // Si hemos pasado el 'if', TypeScript ahora SABE que uploadResult
    // solo puede ser de tipo UploadApiResponse, por lo que el acceso a .secure_url es seguro.
    task.attachments.push(uploadResult.secure_url);

    await this.activityLogService.createLog({
      user: currentUser,
      action: ActionType.ATTACHMENT_ADDED,
      taskId: task._id.toString(),
      details: `Subió el archivo "${file.originalname}"`,
    });

    return task.save();
  }

  async getSummary() {
    const pending = await this.taskModel.countDocuments({
      status: 'pendiente',
      isArchived: { $ne: true },
    });
    const inProgress = await this.taskModel.countDocuments({
      status: 'en progreso',
      isArchived: { $ne: true },
    });
    const highCriticality = await this.taskModel.countDocuments({
      criticality: 'alta',
      isArchived: { $ne: true },
    });

    const now = new Date();
    const overdue = await this.taskModel.countDocuments({
      dueDate: { $lt: now },
      status: { $in: ['pendiente', 'en progreso'] },
      isArchived: { $ne: true },
    });

    return {
      pending,
      inProgress,
      highCriticality,
      overdue,
    };
  }

  findTasksByUserId(userId: string) {
    return this.taskModel
      .find({
        assignedTo: userId,
        // Añadimos el filtro para mostrar solo tareas activas
        status: { $in: ['pendiente', 'en progreso', 'pausada'] },
        // Y nos aseguramos de no mostrar las archivadas
        isArchived: { $ne: true },
      })
      .sort({ dueDate: 1 })
      .populate(this.relationsToPopulate)
      .exec();
  }

  findTasksByEquipmentId(equipmentId: string) {
    return this.taskModel
      .find({ equipment: equipmentId })
      .sort({ createdAt: -1 })
      .populate(this.relationsToPopulate)
      .exec();
  }

  async pause(
    id: string,
    user: UserDocument,
    statusChangeDto: StatusChangeDto,
  ) {
    const task = await this.findOne(id);
    if (task.status !== TaskStatus.EN_PROGRESO) {
      throw new BadRequestException(
        'Solo se pueden pausar tareas que están "en progreso".',
      );
    }

    // Creamos el objeto de historial con los datos explícitos
    const statusUpdate = {
      from: task.status,
      to: TaskStatus.PAUSADA,
      reason: statusChangeDto.reason,
      userId: user._id,
      userName: user.name,
    };
    task.statusHistory.push(statusUpdate as any); // Usamos 'as any' para evitar un conflicto de tipos de sub-doc
    task.status = TaskStatus.PAUSADA;

    // ... (aquí va el logging que ya teníamos)
    await this.activityLogService.createLog({
      user: user,
      action: ActionType.TASK_STATUS_CHANGED,
      taskId: task._id.toString(),
      details: `Pausó la tarea. Motivo: ${statusChangeDto.reason}`,
    });

    return task.save();
  }

  async resume(id: string, user: UserDocument) {
    const task = await this.findOne(id);
    if (task.status !== TaskStatus.PAUSADA) {
      throw new BadRequestException(
        'Solo se pueden reanudar tareas que están "pausadas".',
      );
    }

    const statusUpdate = {
      from: task.status,
      to: TaskStatus.EN_PROGRESO,
      reason: 'Tarea reanudada.',
      userId: user._id,
      userName: user.name,
    };
    task.statusHistory.push(statusUpdate as any);
    task.status = TaskStatus.EN_PROGRESO;

    await this.activityLogService.createLog({
      user: user,
      action: ActionType.TASK_STATUS_CHANGED,
      taskId: task._id.toString(),
      details: 'Reanudó la tarea',
    });
    return task.save();
  }

  async cancel(
    id: string,
    user: UserDocument,
    statusChangeDto: StatusChangeDto,
  ) {
    const task = await this.findOne(id);
    if (task.status === TaskStatus.COMPLETADA) {
      throw new BadRequestException(
        'No se puede cancelar una tarea ya completada.',
      );
    }

    const statusUpdate = {
      from: task.status,
      to: TaskStatus.CANCELADA,
      reason: statusChangeDto.reason,
      userId: user._id,
      userName: user.name,
    };
    task.statusHistory.push(statusUpdate as any);
    task.status = TaskStatus.CANCELADA;

    await this.activityLogService.createLog({
      user: user,
      action: ActionType.TASK_STATUS_CHANGED,
      taskId: task._id.toString(),
      details: `Canceló la tarea. Motivo: ${statusChangeDto.reason}`,
    });
    return task.save();
  }

  async addDailyLog(
    taskId: string,
    currentUser: UserDocument,
    dto: CreateDailyLogDto,
  ) {
    const task = await this.findOne(taskId);

    // Lógica para evitar duplicados en el mismo día (opcional pero recomendado)
    const today = new Date().toISOString().split('T')[0];
    const hasLogForToday = task.dailyLogs.some(
      (log) => new Date(log.createdAt).toISOString().split('T')[0] === today,
    );
    if (hasLogForToday) {
      throw new BadRequestException(
        'Ya existe un registro para esta tarea el día de hoy.',
      );
    }

    const newLog = {
      confirmedBy: currentUser._id,
      notes: dto.notes || 'Asistencia y trabajo confirmados.',
      location: dto.locationId,
    };

    task.dailyLogs.push(newLog as any);

    // Actualizamos la ubicación principal de la tarea a la del último registro
    task.location = dto.locationId as any;

    await this.activityLogService.createLog({
      user: currentUser,
      action: ActionType.COMMENT_ADDED, // Podríamos crear una acción nueva 'DAILY_LOG_ADDED'
      taskId: task._id.toString(),
      details: `Registró un parte diario para la tarea "${task.title}"`,
    });

    return task.save();
  }
}
