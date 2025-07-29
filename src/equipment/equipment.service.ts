import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import {
  Equipment,
  EquipmentDocument,
  EquipmentType,
} from './entities/equipment.entity';
import { BulkCreateEquipmentDto } from './dto/bulk-create-equipment.dto';
import { FilterEquipmentDto } from './dto/filter-equipment.dto';

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

  async findAll(filtersDto: FilterEquipmentDto) {
    const { page = 1, limit = 10, search, type } = filtersDto;

    const filters: FilterQuery<Equipment> = {};
    if (type) {
      filters.type = type;
    }
    if (search) {
      // Busca el término de búsqueda en los campos 'name' y 'code'
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.equipmentModel
        .find(filters)
        .limit(limit)
        .skip((page - 1) * limit)
        .populate('location')
        .sort({ name: 1 })
        .exec(),
      this.equipmentModel.countDocuments(filters),
    ]);

    return { data, total };
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

  async bulkCreate(dto: BulkCreateEquipmentDto) {
    const {
      type,
      parentLocationId,
      quantity,
      namePrefix,
      codePrefix,
      startNumber,
    } = dto;

    const equipmentToCreate: CreateEquipmentDto[] = [];

    for (let i = 0; i < quantity; i++) {
      const currentNumber = startNumber + i;
      // Formateamos el número para que tenga 2 dígitos si es SCB (ej: 01, 02... 18)
      const formattedNumber = currentNumber.toString().padStart(2, '0');

      equipmentToCreate.push({
        type,
        location: parentLocationId,
        name: `${namePrefix} ${formattedNumber}`,
        code: `${codePrefix}${formattedNumber}`,
      });
    }

    // Usamos insertMany de Mongoose para una inserción masiva y eficiente
    const createdEquipment =
      await this.equipmentModel.insertMany(equipmentToCreate);

    return {
      message: `${createdEquipment.length} equipos creados exitosamente.`,
      count: createdEquipment.length,
    };
  }
}
