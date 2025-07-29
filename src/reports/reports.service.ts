// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Task, TaskStatus } from 'src/tasks/entities/task.entity';
import { FilterReportDto } from './dto/filter-report.dto';

// interface KpiAggregationResult {
//   _id: null;
//   activeTasks: number;
//   overdueTasks: number;
// }

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async getTasksByStatus() {
    return this.taskModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: '$count' } },
      { $sort: { status: 1 } },
    ]);
  }

  // --- NUEVO MÉTODO ---
  async getTasksByCriticality() {
    return this.taskModel.aggregate([
      { $group: { _id: '$criticality', count: { $sum: 1 } } },
      { $project: { _id: 0, criticality: '$_id', count: '$count' } },
      { $sort: { _id: 1 } }, // Ordenamos por el valor original
    ]);
  }

  // --- NUEVO MÉTODO ---
  async getTasksByType() {
    return this.taskModel.aggregate([
      { $group: { _id: '$taskType', count: { $sum: 1 } } },
      { $project: { _id: 0, taskType: '$_id', count: '$count' } },
      { $sort: { taskType: 1 } },
    ]);
  }

  // --- NUEVO MÉTODO ---
  // Reemplaza tu método actual con este
  async _getAverageResolutionTime(matchStage: any) {
    const result = await this.taskModel.aggregate([
      // 1. Aplicamos los filtros que nos llegan (ej. rango de fechas)
      { $match: matchStage },
      // 2. Filtramos solo tareas que se puedan medir
      {
        $match: {
          status: TaskStatus.COMPLETADA,
          startedAt: { $exists: true },
          completedAt: { $exists: true },
        },
      },
      // 3. Calculamos la diferencia
      {
        $project: {
          resolutionTime: { $subtract: ['$completedAt', '$startedAt'] },
        },
      },
      // 4. Calculamos el promedio
      {
        $group: {
          _id: null,
          averageMilliseconds: { $avg: '$resolutionTime' },
        },
      },
    ]);

    if (result.length === 0) {
      return { averageMilliseconds: 0 };
    }

    return { averageMilliseconds: result[0].averageMilliseconds };
  }

  async getAverageTimeByGroup(groupByField: string) {
    const result = await this.taskModel.aggregate([
      // 1. Filtrar tareas completadas con fechas válidas
      {
        $match: {
          status: TaskStatus.COMPLETADA,
          startedAt: { $exists: true, $ne: null },
          completedAt: { $exists: true, $ne: null },
        },
      },
      // 2. Calcular la duración de cada tarea
      {
        $project: {
          resolutionTime: { $subtract: ['$completedAt', '$startedAt'] },
          groupField: `$${groupByField}`, // Campo por el que agruparemos (dinámico)
        },
      },
      // 3. Agrupar por el campo especificado y calcular el promedio
      {
        $group: {
          _id: '$groupField',
          averageMilliseconds: { $avg: '$resolutionTime' },
        },
      },
      // 4. Renombrar campos para una salida limpia
      {
        $project: {
          _id: 0,
          group: '$_id', // El grupo puede ser 'alta', 'media', 'baja', etc.
          averageMilliseconds: '$averageMilliseconds',
        },
      },
      { $sort: { group: 1 } },
    ]);

    // Convertimos milisegundos a un formato más legible
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.map((item) => ({
      ...item,
      averageHours: item.averageMilliseconds / (1000 * 60 * 60),
    }));
  }

  async getWorkloadReport() {
    const now = new Date();
    return this.taskModel.aggregate([
      // Etapa 1: Filtrar solo las tareas activas (no completadas ni canceladas)
      {
        $match: {
          status: { $in: ['pendiente', 'en progreso', 'pausada'] },
          assignedTo: { $exists: true, $ne: null }, // Solo tareas asignadas a usuarios
          isArchived: { $ne: true },
        },
      },
      // Etapa 2: Agrupar por usuario asignado y contar las tareas
      {
        $group: {
          _id: '$assignedTo', // Agrupamos por el ID del usuario
          activeTasks: { $sum: 1 }, // Contamos el total de tareas activas
          // Contamos las tareas vencidas usando una suma condicional
          overdueTasks: {
            $sum: {
              $cond: [{ $lt: ['$dueDate', now] }, 1, 0],
            },
          },
        },
      },
      // Etapa 3: Unir con la colección de usuarios para obtener sus nombres
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      // Etapa 4: Desempaquetar el resultado de la unión y dar formato a la salida
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userName: { $arrayElemAt: ['$userDetails.name', 0] },
          activeTasks: '$activeTasks',
          overdueTasks: '$overdueTasks',
        },
      },
      // Etapa 5: Ordenar por nombre de usuario
      {
        $sort: {
          userName: 1,
        },
      },
    ]);
  }

  // En src/reports/reports.service.ts

  async getDashboardData(filters: FilterReportDto) {
    const interactiveMatchStage = this.createMatchStage(filters);

    const [
      kpis,
      tasksByStatus,
      tasksByCriticality,
      tasksByType,
      topTechnicians,
      topFailingEquipment,
      tasksTrend,
    ] = await Promise.all([
      this._getKpiData(interactiveMatchStage),
      this._getTasksByStatus(interactiveMatchStage),
      this._getTasksByCriticality(interactiveMatchStage),
      this._getTasksByType(interactiveMatchStage),
      this._getTopTechnicians(interactiveMatchStage),
      this._getTopFailingEquipment(interactiveMatchStage),
      this._getTasksTrend(interactiveMatchStage),
    ]);

    return {
      kpis,
      tasksByStatus,
      tasksByCriticality,
      tasksByType,
      topTechnicians,
      topFailingEquipment,
      tasksTrend,
    };
  }

  // --- FUNCIONES DE AYUDA PRIVADAS CON LAS AGREGACIONES ---

  private createMatchStage(filters: FilterReportDto): any {
    // Siempre excluimos las archivadas
    const matchQuery: any = { isArchived: { $ne: true } };

    // --- LÓGICA DE FILTROS COMPLETA ---

    // Filtros de fecha (si existen ambos)
    if (filters.startDate && filters.endDate) {
      matchQuery.createdAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    // Filtro por estado
    if (filters.status) {
      matchQuery.status = filters.status;
    }

    // Filtro por criticidad
    if (filters.criticality) {
      matchQuery.criticality = filters.criticality;
    }

    // Filtro por tipo de tarea
    if (filters.taskType) {
      matchQuery.taskType = filters.taskType;
    }

    // Filtro por usuario asignado
    if (filters.assignedTo) {
      matchQuery.assignedTo = new mongoose.Types.ObjectId(filters.assignedTo);
    }

    // Filtro por equipo específico
    if (filters.equipmentId) {
      matchQuery.equipment = new mongoose.Types.ObjectId(filters.equipmentId);
    }

    // --- FIN DE LA LÓGICA ---

    return matchQuery;
  }

  private async _getKpiData(matchStage: any) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await this.taskModel.aggregate([
      { $match: matchStage },
      {
        // $facet nos permite ejecutar múltiples "sub-consultas" en paralelo
        $facet: {
          // Cálculo 1: Tareas activas y vencidas
          activeAndOverdue: [
            {
              $group: {
                _id: null,
                activeTasks: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          '$status',
                          ['pendiente', 'en progreso', 'pausada'],
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                overdueTasks: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          {
                            $in: [
                              '$status',
                              ['pendiente', 'en progreso', 'pausada'],
                            ],
                          },
                          { $lt: ['$dueDate', now] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          // Cálculo 2: Creadas vs Completadas este mes
          thisMonth: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            {
              $group: {
                _id: null,
                createdThisMonth: { $sum: 1 },
                completedThisMonth: {
                  $sum: {
                    $cond: [{ $eq: ['$status', TaskStatus.COMPLETADA] }, 1, 0],
                  },
                },
              },
            },
          ],
          // Cálculo 3: Tiempo promedio de resolución
          avgResolution: [
            {
              $match: {
                status: TaskStatus.COMPLETADA,
                startedAt: { $exists: true },
                completedAt: { $exists: true },
              },
            },
            {
              $project: {
                resolutionTime: { $subtract: ['$completedAt', '$startedAt'] },
              },
            },
            { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } },
          ],
        },
      },
    ]);

    // Combinamos los resultados de las 3 sub-consultas en un solo objeto
    const kpis = {
      activeTasks: result[0]?.activeAndOverdue[0]?.activeTasks || 0,
      overdueTasks: result[0]?.activeAndOverdue[0]?.overdueTasks || 0,
      createdThisMonth: result[0]?.thisMonth[0]?.createdThisMonth || 0,
      completedThisMonth: result[0]?.thisMonth[0]?.completedThisMonth || 0,
      avgResolutionMilliseconds: result[0]?.avgResolution[0]?.avgTime || 0,
    };
    return kpis;
  }

  private async _getTasksByStatus(matchStage: any) {
    return this.taskModel.aggregate([
      {
        $match: {
          ...matchStage,
          status: { $in: ['pendiente', 'en progreso', 'pausada'] },
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);
  }

  private async _getTasksByCriticality(matchStage: any) {
    return this.taskModel.aggregate([
      {
        $match: {
          ...matchStage,
          status: { $in: ['pendiente', 'en progreso', 'pausada'] },
        },
      },
      { $group: { _id: '$criticality', count: { $sum: 1 } } },
      { $project: { criticality: '$_id', count: 1, _id: 0 } },
    ]);
  }

  private async _getTasksByType(matchStage: any) {
    return this.taskModel.aggregate([
      {
        $match: {
          ...matchStage,
          status: { $in: ['pendiente', 'en progreso', 'pausada'] },
        },
      },
      { $group: { _id: '$taskType', count: { $sum: 1 } } },
      { $project: { taskType: '$_id', count: 1, _id: 0 } },
    ]);
  }

  private async _getTopTechnicians(matchStage: any) {
    // Tareas completadas en los últimos 30 días
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const filters = {
      ...matchStage,
      status: TaskStatus.COMPLETADA,
      completedAt: { $gte: last30Days },
    };
    return this.taskModel.aggregate([
      {
        $match: filters,
      },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userName: { $arrayElemAt: ['$userDetails.name', 0] },
          count: 1,
        },
      },
    ]);
  }

  private async _getTopFailingEquipment(matchStage: any) {
    const filters = { ...matchStage, taskType: 'mantenimiento_correctivo' };
    return this.taskModel.aggregate([
      {
        $match: filters,
      },
      { $group: { _id: '$equipment', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'equipment',
          localField: '_id',
          foreignField: '_id',
          as: 'equipmentDetails',
        },
      },
      {
        $project: {
          _id: 0,
          equipmentId: '$_id', // <-- Añadir esta línea
          equipmentName: { $arrayElemAt: ['$equipmentDetails.name', 0] },
          count: 1,
        },
      },
    ]);
  }

  private async _getTasksTrend(matchStage: any) {
    const last6Months = new Date();
    last6Months.setMonth(last6Months.getMonth() - 6);
    const filters = { ...matchStage, createdAt: { $gte: last6Months } };
    return this.taskModel.aggregate([
      { $match: filters },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          created: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', TaskStatus.COMPLETADA] }, 1, 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: 0, month: '$_id', created: 1, completed: 1 } },
    ]);
  }
}
