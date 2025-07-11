// src/activity-log/activity-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  ActivityLog,
  ActivityLogDocument,
  ActionType,
} from './entities/activity-log.entity';
import { UserDocument } from 'src/users/entities/user.entity';
import { FilterActivityLogDto } from './dto/filter-activity-log.dto';

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

  async findAll(filters: FilterActivityLogDto) {
    const { userId, taskId, action, startDate, endDate } = filters;
    const query: FilterQuery<ActivityLogDocument> = {};

    if (userId) {
      query.user = userId;
    }
    if (taskId) {
      query.task = taskId;
    }
    if (action) {
      query.action = action;
    }
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    return this.activityLogModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('user', 'name photoUrl')
      .populate('task', 'title')
      .exec();
  }
}
