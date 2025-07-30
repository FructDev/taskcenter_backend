// src/scheduled-tasks/scheduled-tasks.service.ts
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ScheduledTask,
  ScheduledTaskDocument,
} from './entities/scheduled-task.entity';
import { TasksService } from 'src/tasks/tasks.service';
import { EquipmentService } from 'src/equipment/equipment.service';
import { UpdateScheduledTaskDto } from './dto/update-scheduled-task.dto';
import { CreateScheduledTaskDto } from './dto/create-scheduled-task.dto';
// import { TaskStatus } from 'src/tasks/entities/task.entity';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    @InjectModel(ScheduledTask.name)
    private scheduledTaskModel: Model<ScheduledTaskDocument>,
    private readonly tasksService: TasksService,
    private readonly equipmentService: EquipmentService,
  ) {}

  create(createScheduledTaskDto: CreateScheduledTaskDto) {
    const newRule = new this.scheduledTaskModel(createScheduledTaskDto);
    return newRule.save();
  }

  findAll() {
    return this.scheduledTaskModel.find().populate('taskTemplate').exec();
  }

  async findOne(id: string) {
    const rule = await this.scheduledTaskModel.findById(id).exec();
    if (!rule)
      throw new NotFoundException(
        `Regla programada con ID "${id}" no encontrada.`,
      );
    return rule;
  }

  async update(id: string, updateScheduledTaskDto: UpdateScheduledTaskDto) {
    const updatedRule = await this.scheduledTaskModel.findByIdAndUpdate(
      id,
      updateScheduledTaskDto,
      { new: true },
    );
    if (!updatedRule)
      throw new NotFoundException(
        `Regla programada con ID "${id}" no encontrada.`,
      );
    return updatedRule;
  }

  async remove(id: string) {
    const deletedRule = await this.scheduledTaskModel.findByIdAndDelete(id);
    if (!deletedRule)
      throw new NotFoundException(
        `Regla programada con ID "${id}" no encontrada.`,
      );
  }

  // Este método se ejecutará automáticamente todos los días a la medianoche.
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleScheduledTasks() {
    this.logger.log('Iniciando verificación de tareas programadas...');

    // Aquí iría la lógica compleja para interpretar el cron string de cada regla.
    // Por simplicidad en esta primera versión, generaremos tareas mensuales.
    // Buscamos reglas que no se hayan ejecutado en los últimos 28 días.
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 28);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const rulesToRun = await this.scheduledTaskModel
      .find({
        isEnabled: true,
        $or: [
          { lastRunAt: { $lte: oneMonthAgo } },
          { lastRunAt: { $exists: false } },
        ],
      })
      .populate('taskTemplate')
      .exec();

    this.logger.log(
      `Se encontraron ${rulesToRun.length} reglas para ejecutar.`,
    );

    for (const rule of rulesToRun) {
      const equipments = await this.equipmentService.findByType(
        rule.targetEquipmentType,
      );

      for (const equipment of equipments) {
        const taskTitle = rule.taskTemplate.title.replace(
          '{{EQUIPO}}',
          equipment.name,
        );

        await this.tasksService.create(
          {
            title: taskTitle,
            description: rule.taskTemplate.description,
            taskType: rule.taskTemplate.taskType,
            criticality: rule.taskTemplate.criticality,
            location: equipment.location._id.toString(),
            equipment: equipment._id.toString(),
            dueDate: dueDate.toISOString(), // Vence en 30 días
          },
          null,
        ); // Pasamos null como currentUser porque es una acción del sistema

        await this.scheduledTaskModel.updateOne(
          { _id: rule._id },
          { lastRunAt: new Date() },
        );

        this.logger.log(`Tarea creada para el equipo: ${equipment.name}`);
      }

      // Actualizamos la fecha de la última ejecución de la regla
      rule.lastRunAt = new Date();
      await rule.save();
    }
  }

  private async generateTasksForRule(rule: ScheduledTaskDocument) {
    const populatedRule = await rule.populate('taskTemplate');
    const equipments = await this.equipmentService.findByType(
      populatedRule.targetEquipmentType,
    );
    this.logger.log(
      `Generando ${equipments.length} tareas para la regla "${populatedRule.name}"...`,
    );

    for (const equipment of equipments) {
      const taskTitle = populatedRule.taskTemplate.title.replace(
        '{{EQUIPO}}',
        equipment.name,
      );
      await this.tasksService.create(
        {
          title: taskTitle,
          description: populatedRule.taskTemplate.description,
          taskType: populatedRule.taskTemplate.taskType,
          criticality: populatedRule.taskTemplate.criticality,
          location: equipment.location._id.toString(),
          equipment: equipment._id.toString(),
          dueDate: new Date(
            new Date().setDate(new Date().getDate() + 30),
          ).toISOString(),
        },
        null,
      );
    }
  }

  async toggleStatus(id: string) {
    const rule = await this.findOne(id);
    rule.isEnabled = !rule.isEnabled;
    return rule.save();
  }

  // --- NUEVO MÉTODO ---
  async runRuleNow(id: string) {
    this.logger.log(`Ejecución manual forzada para la regla ${id}`);
    const rule = await this.findOne(id);
    if (!rule.isEnabled) {
      throw new BadRequestException(
        'No se puede forzar la ejecución de una regla deshabilitada.',
      );
    }
    // Aquí reutilizamos la lógica del cron job, pero para una sola regla
    // Esta es una versión simplificada:
    await this.generateTasksForRule(rule);
    await this.scheduledTaskModel.updateOne(
      { _id: rule._id },
      { lastRunAt: new Date() },
    );

    return {
      message: `Ejecución de la regla "${rule.name}" forzada con éxito.`,
    };
  }

  // Necesitamos un método en EquipmentService para buscar por tipo
  // Y necesitamos que el 'create' de TasksService acepte un currentUser nulo
}
