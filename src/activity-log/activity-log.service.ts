// src/activity-log/activity-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ActivityLog,
  ActivityLogDocument,
  ActionType,
} from './entities/activity-log.entity';
import { UserDocument } from 'src/users/entities/user.entity';

interface LogData {
  user: UserDocument;
  action: ActionType;
  taskId?: string;
  details?: string;
}

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(ActivityLog.name)
    private activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async createLog(logData: LogData): Promise<void> {
    const { user, action, taskId, details } = logData;

    const newLog = new this.activityLogModel({
      user: user._id,
      action,
      task: taskId,
      details,
    });

    await newLog.save();
  }

  findAll() {
    return this.activityLogModel
      .find()
      .sort({ createdAt: -1 }) // Ordenar por más reciente
      .limit(100) // Limitar a los últimos 100 eventos para no sobrecargar
      .populate('user', 'name photoUrl') // Populamos solo los campos que necesitamos del usuario
      .populate('task', 'title') // Y de la tarea
      .exec();
  }
}
