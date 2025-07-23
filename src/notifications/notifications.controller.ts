import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private usersService: UsersService) {}

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
}
