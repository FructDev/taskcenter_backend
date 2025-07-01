// src/contractors/contractors.controller.ts
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
  FileTypeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ContractorsService } from './contractors.service';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('contractors')
@UseGuards(JwtAuthGuard, RolesGuard) // ¡Protegemos TODO el controlador!
export class ContractorsController {
  constructor(private readonly contractorsService: ContractorsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PLANIFICADOR)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createContractorDto: CreateContractorDto) {
    return this.contractorsService.create(createContractorDto);
  }

  @Get()
  // Todos los roles autenticados pueden ver la lista
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PLANIFICADOR,
    UserRole.TECNICO,
  )
  findAll() {
    return this.contractorsService.findAll();
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PLANIFICADOR,
    UserRole.TECNICO,
  )
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.contractorsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PLANIFICADOR)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateContractorDto: UpdateContractorDto,
  ) {
    return this.contractorsService.update(id, updateContractorDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.contractorsService.remove(id);
  }

  @Post(':id/photo')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PLANIFICADOR)
  @UseInterceptors(FileInterceptor('file'))
  uploadContractorPhoto(
    @Param('id', ParseMongoIdPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.contractorsService.updateContractorPhoto(id, file);
  }
}
