import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import {
  Equipment,
  EquipmentDocument,
  EquipmentType,
} from './entities/equipment.entity';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectModel(Equipment.name)
    private equipmentModel: Model<EquipmentDocument>,
  ) {}

  async create(createEquipmentDto: CreateEquipmentDto) {
    try {
      const newEquipment = new this.equipmentModel(createEquipmentDto);
      return await newEquipment.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          `Ya existe un equipo con el código "${createEquipmentDto.code}"`,
        );
      }
      throw new InternalServerErrorException(
        'Algo salió mal al crear el equipo.',
      );
    }
  }

  findAll() {
    return this.equipmentModel.find().populate('location').exec();
  }

  async findOne(id: string) {
    const equipment = await this.equipmentModel
      .findById(id)
      .populate('location')
      .exec();
    if (!equipment) {
      throw new NotFoundException(`Equipo con ID "${id}" no encontrado.`);
    }
    return equipment;
  }

  async update(id: string, updateEquipmentDto: UpdateEquipmentDto) {
    try {
      const updatedEquipment = await this.equipmentModel
        .findByIdAndUpdate(id, updateEquipmentDto, { new: true })
        .exec();
      if (!updatedEquipment) {
        throw new NotFoundException(`Equipo con ID "${id}" no encontrado.`);
      }
      return updatedEquipment;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          `Ya existe un equipo con el código "${updateEquipmentDto.code}"`,
        );
      }
      throw new InternalServerErrorException(
        'Algo salió mal al actualizar el equipo.',
      );
    }
  }

  async remove(id: string) {
    const deletedEquipment = await this.equipmentModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedEquipment) {
      throw new NotFoundException(`Equipo con ID "${id}" no encontrado.`);
    }
  }

  findByType(type: EquipmentType) {
    return this.equipmentModel.find({ type }).populate('location').exec();
  }
}
