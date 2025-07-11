// src/task-templates/task-templates.service.ts

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskTemplateDto } from './dto/create-task-template.dto';
import { UpdateTaskTemplateDto } from './dto/update-task-template.dto';
import {
  TaskTemplate,
  TaskTemplateDocument,
} from './entities/task-template.entity';

@Injectable()
export class TaskTemplatesService {
  constructor(
    @InjectModel(TaskTemplate.name)
    private taskTemplateModel: Model<TaskTemplateDocument>,
  ) {}

  async create(createTaskTemplateDto: CreateTaskTemplateDto) {
    try {
      const newTemplate = new this.taskTemplateModel(createTaskTemplateDto);
      return await newTemplate.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Ya existe una plantilla con ese nombre.');
      }
      throw new InternalServerErrorException(
        'Algo salió mal al crear la plantilla.',
      );
    }
  }

  findAll() {
    // Añadimos .populate('location') para que nos devuelva el objeto completo
    return this.taskTemplateModel
      .find()
      .sort({ name: 1 })
      .populate('location')
      .populate('requiredPpe')
      .exec();
  }

  async findOne(id: string) {
    const template = await this.taskTemplateModel
      .findById(id)
      .populate('location')
      .populate('requiredPpe')
      .exec();
    if (!template) {
      throw new NotFoundException(`Plantilla con ID "${id}" no encontrada.`);
    }
    return template;
  }

  async update(id: string, updateTaskTemplateDto: UpdateTaskTemplateDto) {
    try {
      const updatedTemplate = await this.taskTemplateModel
        .findByIdAndUpdate(id, updateTaskTemplateDto, { new: true })
        .exec();

      if (!updatedTemplate) {
        throw new NotFoundException(`Plantilla con ID "${id}" no encontrada.`);
      }
      return updatedTemplate;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Ya existe una plantilla con ese nombre.');
      }
      throw new InternalServerErrorException(
        'Algo salió mal al actualizar la plantilla.',
      );
    }
  }

  async remove(id: string) {
    const deletedTemplate = await this.taskTemplateModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedTemplate) {
      throw new NotFoundException(`Plantilla con ID "${id}" no encontrada.`);
    }
    return; // Éxito, no se devuelve nada
  }
}
