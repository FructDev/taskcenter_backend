// src/contractors/contractors.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';
import { Contractor, ContractorDocument } from './entities/contractor.entity';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class ContractorsService {
  constructor(
    @InjectModel(Contractor.name)
    private contractorModel: Model<ContractorDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createContractorDto: CreateContractorDto) {
    try {
      const newContractor = new this.contractorModel(createContractorDto);
      return await newContractor.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          'Ya existe un contratista con ese nombre de empresa',
        );
      }
      throw new InternalServerErrorException(
        'Algo salió mal al crear el contratista',
      );
    }
  }

  findAll() {
    return this.contractorModel.find().exec();
  }

  async findOne(id: string) {
    const contractor = await this.contractorModel.findById(id).exec();
    if (!contractor) {
      throw new NotFoundException(`Contratista con ID "${id}" no encontrado`);
    }
    return contractor;
  }

  async update(id: string, updateContractorDto: UpdateContractorDto) {
    try {
      const updatedContractor = await this.contractorModel
        .findByIdAndUpdate(id, updateContractorDto, { new: true })
        .exec();
      if (!updatedContractor) {
        throw new NotFoundException(`Contratista con ID "${id}" no encontrado`);
      }
      return updatedContractor;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          'Ya existe un contratista con ese nombre de empresa',
        );
      }
      throw new InternalServerErrorException(
        'Algo salió mal al actualizar el contratista',
      );
    }
  }

  async remove(id: string) {
    const deletedContractor = await this.contractorModel.findByIdAndDelete(id);
    if (!deletedContractor) {
      throw new NotFoundException(`Contratista con ID "${id}" no encontrado`);
    }
    return;
  }

  async updateContractorPhoto(contractorId: string, file: Express.Multer.File) {
    const uploadResult = await this.cloudinaryService.uploadFile(file);
    if (!uploadResult.secure_url) {
      throw new InternalServerErrorException('Falló la subida del logo.');
    }
    const updatedContractor = await this.contractorModel.findByIdAndUpdate(
      contractorId,
      { photoUrl: uploadResult.secure_url },
      { new: true },
    );
    if (!updatedContractor)
      throw new NotFoundException('Contratista no encontrado');
    return updatedContractor;
  }
}
