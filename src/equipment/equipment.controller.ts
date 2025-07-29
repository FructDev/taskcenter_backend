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
  Query,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { BulkCreateEquipmentDto } from './dto/bulk-create-equipment.dto';
import { FilterEquipmentDto } from './dto/filter-equipment.dto';

@Controller('equipment')
@UseGuards(JwtAuthGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PLANIFICADOR)
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(createEquipmentDto);
  }

  @Get()
  findAll(@Query() filtersDto: FilterEquipmentDto) {
    return this.equipmentService.findAll(filtersDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.equipmentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PLANIFICADOR)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(id, updateEquipmentDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PLANIFICADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.equipmentService.remove(id);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR) // Solo roles altos pueden hacer creaciones masivas
  @UseGuards(RolesGuard)
  bulkCreate(@Body() bulkCreateDto: BulkCreateEquipmentDto) {
    return this.equipmentService.bulkCreate(bulkCreateDto);
  }
}
