import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PpeItemsService } from './ppe-items.service';
import { CreatePpeItemDto } from './dto/create-ppe-item.dto';
import { UpdatePpeItemDto } from './dto/update-ppe-item.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id/parse-mongo-id.pipe';

@Controller('ppe-items')
@UseGuards(JwtAuthGuard)
export class PpeItemsController {
  constructor(private readonly ppeItemsService: PpeItemsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  create(@Body() createPpeItemDto: CreatePpeItemDto) {
    return this.ppeItemsService.create(createPpeItemDto);
  }

  @Get()
  findAll() {
    return this.ppeItemsService.findAll();
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updatePpeItemDto: UpdatePpeItemDto,
  ) {
    return this.ppeItemsService.update(id, updatePpeItemDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.ppeItemsService.remove(id);
  }
}
