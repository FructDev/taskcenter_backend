import { Module } from '@nestjs/common';
import { PpeItemsService } from './ppe-items.service';
import { PpeItemsController } from './ppe-items.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PpeItem, PpeItemSchema } from './entities/ppe-item.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PpeItem.name, schema: PpeItemSchema }]),
  ],
  controllers: [PpeItemsController],
  providers: [PpeItemsService],
})
export class PpeItemsModule {}
