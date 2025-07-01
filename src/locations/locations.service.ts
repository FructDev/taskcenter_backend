// src/locations/locations.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location, LocationDocument } from './entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
  ) {}

  async create(createLocationDto: CreateLocationDto) {
    if (createLocationDto.parentLocation) {
      await this.findOne(createLocationDto.parentLocation); // Valida que el padre exista
    }
    try {
      const newLocation = new this.locationModel(createLocationDto);
      return await newLocation.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          `Ya existe una ubicación con el código "${createLocationDto.code}"`,
        );
      }
      throw new InternalServerErrorException(
        'Algo salió mal al crear la ubicación',
      );
    }
  }

  findAll() {
    return this.locationModel.find().populate('parentLocation').exec();
  }

  async findOne(id: string) {
    const location = await this.locationModel
      .findById(id)
      .populate('parentLocation')
      .exec();
    if (!location) {
      throw new NotFoundException(`Ubicación con ID "${id}" no encontrada`);
    }
    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    if (updateLocationDto.parentLocation) {
      await this.findOne(updateLocationDto.parentLocation);
    }
    try {
      const updatedLocation = await this.locationModel
        .findByIdAndUpdate(id, updateLocationDto, { new: true })
        .exec();
      if (!updatedLocation) {
        throw new NotFoundException(`Ubicación con ID "${id}" no encontrada`);
      }
      return updatedLocation;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          `Ya existe una ubicación con el código "${updateLocationDto.code}"`,
        );
      }
      throw new InternalServerErrorException(
        'Algo salió mal al actualizar la ubicación',
      );
    }
  }

  async remove(id: string) {
    const deletedLocation = await this.locationModel.findByIdAndDelete(id);
    if (!deletedLocation) {
      throw new NotFoundException(`Ubicación con ID "${id}" no encontrada`);
    }
    return;
  }
}
