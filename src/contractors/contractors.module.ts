// src/contractors/contractors.module.ts

import { Module } from '@nestjs/common';
import { ContractorsService } from './contractors.service';
import { ContractorsController } from './contractors.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Contractor, ContractorSchema } from './entities/contractor.entity';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  // ESTA ES LA LÍNEA QUE FALTABA
  imports: [
    MongooseModule.forFeature([
      { name: Contractor.name, schema: ContractorSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [ContractorsController],
  providers: [ContractorsService],
  exports: [ContractorsService],
})
export class ContractorsModule {}
