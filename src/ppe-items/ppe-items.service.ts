import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePpeItemDto } from './dto/create-ppe-item.dto';
import { UpdatePpeItemDto } from './dto/update-ppe-item.dto';
import { PpeItem, PpeItemDocument } from './entities/ppe-item.entity';

@Injectable()
export class PpeItemsService {
  constructor(
    @InjectModel(PpeItem.name) private ppeItemModel: Model<PpeItemDocument>,
  ) {}

  async create(createPpeItemDto: CreatePpeItemDto) {
    try {
      const newItem = new this.ppeItemModel(createPpeItemDto);
      return await newItem.save();
    } catch (error) {
      if (error.code === 11000)
        throw new ConflictException('Ya existe un EPP con ese nombre.');
      throw new InternalServerErrorException();
    }
  }

  findAll() {
    return this.ppeItemModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    const item = await this.ppeItemModel.findById(id).exec();
    if (!item) throw new NotFoundException(`EPP con ID "${id}" no encontrado.`);
    return item;
  }

  async update(id: string, updatePpeItemDto: UpdatePpeItemDto) {
    const updatedItem = await this.ppeItemModel
      .findByIdAndUpdate(id, updatePpeItemDto, { new: true })
      .exec();
    if (!updatedItem)
      throw new NotFoundException(`EPP con ID "${id}" no encontrado.`);
    return updatedItem;
  }

  async remove(id: string) {
    const deletedItem = await this.ppeItemModel.findByIdAndDelete(id).exec();
    if (!deletedItem)
      throw new NotFoundException(`EPP con ID "${id}" no encontrado.`);
  }
}
