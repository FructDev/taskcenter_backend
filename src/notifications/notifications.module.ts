import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule], // Importamos UsersModule para poder usar UsersService
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService], // Exportamos para que TasksService pueda usarlo
})
export class NotificationsModule {}
