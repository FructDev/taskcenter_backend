import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UsersService } from 'src/users/users.service';

// 1. Importamos los módulos nativos de Node.js para leer archivos
import { readFileSync } from 'fs';
import { resolve } from 'path';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private usersService: UsersService) {
    if (admin.apps.length === 0) {
      try {
        // 2. Construimos la ruta absoluta al archivo de credenciales
        const serviceAccountPath = resolve(
          process.cwd(),
          'firebase-service-account.json',
        );

        // 3. Leemos el archivo como texto y lo parseamos a JSON
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

  // El resto de los métodos se mantienen igual
  async sendNotificationToUser(userId: string, title: string, body: string) {
    this.logger.log(`Buscando usuario ${userId} para enviar notificación...`);
    const user = await this.usersService.findOne(userId);

    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      this.logger.warn(
        `Usuario ${userId} no encontrado o sin tokens. Abortando.`,
      );
      return;
    }

    const validTokens = user.fcmTokens.filter((token) => token);
    if (validTokens.length === 0) {
      this.logger.warn(`Usuario ${userId} no tiene tokens válidos.`);
      return;
    }

    const message: admin.messaging.MulticastMessage = {
      notification: { title, body },
      tokens: validTokens,
      webpush: {
        fcmOptions: {
          link: 'https://girasol-pwa.vercel.app/my-tasks',
        },
      },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `Respuesta de Firebase. Éxitos: ${response.successCount}, Fallos: ${response.failureCount}`,
      );

      // --- LÓGICA DE LIMPIEZA DE TOKENS INVÁLIDOS ---
      if (response.failureCount > 0) {
        const tokensToDelete: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const failedToken = validTokens[idx];
            this.logger.error(`Falló el token: ${failedToken}`, resp.error);

            // Si el error indica que el token es inválido, lo añadimos a la lista de borrado
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
          // Usamos $pullAll para eliminar múltiples tokens de la base de datos a la vez
          await this.usersService.removeFcmTokens(userId, tokensToDelete);
        }
      }
      // --- FIN DE LA LÓGICA DE LIMPIEZA ---
    } catch (error) {
      this.logger.error(
        'Error CRÍTICO al intentar enviar notificaciones:',
        error,
      );
    }
  }
}
