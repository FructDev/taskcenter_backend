import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { NotificationsService } from './notifications.service';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id/parse-mongo-id.pipe';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  @Post('subscribe')
  async subscribe(@Req() req, @Body('token') token: string) {
    await this.usersService.addFcmToken(req.user.id, token);
    return { message: 'Suscripción exitosa' };
  }

  @Post('unsubscribe')
  async unsubscribe(@Req() req, @Body('token') token: string) {
    await this.usersService.removeFcmToken(req.user.id, token);
    return { message: 'Suscripción eliminada' };
  }

  @Get('my')
  async getMyNotifications(@Req() req) {
    return this.notificationsService.findAllForUser(req.user.id);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { message: 'Todas las notificaciones marcadas como leídas' };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseMongoIdPipe) id: string, @Req() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
