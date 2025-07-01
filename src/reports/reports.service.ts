// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskStatus } from 'src/tasks/entities/task.entity';

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
  async getAverageResolutionTime() {
    const result = await this.taskModel.aggregate([
      {
        // 1. Filtrar solo tareas completadas que tengan fecha de inicio y fin
        $match: {
          status: TaskStatus.COMPLETADA,
          startedAt: { $exists: true },
          completedAt: { $exists: true },
        },
      },
      {
        // 2. Calcular la diferencia de tiempo en milisegundos
        $project: {
          resolutionTime: { $subtract: ['$completedAt', '$startedAt'] },
        },
      },
      {
        // 3. Calcular el promedio de todas las diferencias
        $group: {
          _id: null, // Agrupamos todos los documentos en uno solo
          averageMilliseconds: { $avg: '$resolutionTime' },
        },
      },
    ]);

    if (result.length === 0) {
      return { averageMilliseconds: 0, averageHours: 0 };
    }

    const avgMs = result[0].averageMilliseconds;
    return {
      averageMilliseconds: avgMs,
      averageHours: avgMs / (1000 * 60 * 60), // Convertimos a horas
    };
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
}
