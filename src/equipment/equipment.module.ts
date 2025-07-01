import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Equipment, EquipmentSchema } from './entities/equipment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Equipment.name, schema: EquipmentSchema },
    ]),
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService], // Exportamos para que TasksModule pueda usarlo
})
export class EquipmentModule {}
