import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UsersService } from 'src/users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './entities/notification.entity';

import { readFileSync } from 'fs';
import { resolve } from 'path';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private usersService: UsersService,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {
    if (admin.apps.length === 0) {
      try {
        const serviceAccountPath = resolve(
          process.cwd(),
          'firebase-service-account.json',
        );

        const serviceAccount = JSON.parse(
          readFileSync(serviceAccountPath, 'utf8'),
        );

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        this.logger.log('Firebase Admin SDK inicializado correctamente.');
      } catch (error) {
        this.logger.error('Error al inicializar Firebase Admin SDK:', error);
        this.logger.error(
          'Asegúrate de que el archivo "firebase-service-account.json" exista en la raíz del proyecto "api".',
        );
      }
    }
  }

  async sendNotificationToUser(
    userId: string,
    title: string,
    body: string,
    taskId?: string,
  ) {
    this.logger.log(`Buscando usuario ${userId} para enviar notificación...`);
    const user = await this.usersService.findOne(userId);

    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      this.logger.warn(
        `Usuario ${userId} no encontrado o sin tokens. Abortando.`,
      );
    } else {
      const validTokens = user.fcmTokens.filter((token) => token);

      if (validTokens.length === 0) {
        this.logger.warn(`Usuario ${userId} no tiene tokens válidos.`);
      } else {
        const taskPath = taskId ? `/tasks/${taskId}` : '/my-tasks';
        const message: admin.messaging.MulticastMessage = {
          notification: { title, body },
          tokens: validTokens,
          data: taskId ? { taskId } : {},
          webpush: {
            fcmOptions: {
              link: `https://girasol-pwa.vercel.app${taskPath}`,
            },
          },
        };

        try {
          const response = await admin
            .messaging()
            .sendEachForMulticast(message);
          this.logger.log(
            `Respuesta de Firebase. Éxitos: ${response.successCount}, Fallos: ${response.failureCount}`,
          );

          if (response.failureCount > 0) {
            const tokensToDelete: string[] = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success && resp.error) {
                const failedToken = validTokens[idx];
                this.logger.error(`Falló el token: ${failedToken}`, resp.error);

                const errorCode = resp.error.code;
                if (
                  errorCode === 'messaging/invalid-registration-token' ||
                  errorCode === 'messaging/registration-token-not-registered'
                ) {
                  tokensToDelete.push(failedToken);
                }
              }
            });

            if (tokensToDelete.length > 0) {
              this.logger.log(
                `Limpiando ${tokensToDelete.length} tokens inválidos para el usuario ${userId}`,
              );
              await this.usersService.removeFcmTokens(userId, tokensToDelete);
            }
          }
        } catch (error) {
          this.logger.error(
            'Error CRÍTICO al intentar enviar notificaciones:',
            error,
          );
        }
      }
    }

    try {
      const notificationData: any = { userId, title, body };
      if (taskId) notificationData.taskId = taskId;
      await this.notificationModel.create(notificationData);
    } catch (error) {
      this.logger.error('Error al guardar notificación en DB:', error);
    }
  }

  async findAllForUser(userId: string) {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean()
      .exec();
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string) {
    return this.notificationModel.countDocuments({ userId, isRead: false });
  }
}
