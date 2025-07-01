// src/common/pipes/parse-mongo-id.pipe.ts

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isMongoId } from 'class-validator';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    console.log(typeof metadata);
    // 'value' es el ID que llega desde el parámetro de la ruta
    if (!isMongoId(value)) {
      // Si no es un ID de Mongo válido, lanzamos una excepción clara.
      // NestJS la convertirá en una respuesta 400 Bad Request.
      throw new BadRequestException(`El ID "${value}" no es un MongoID válido`);
    }
    return value; // Si es válido, lo retornamos sin cambios.
  }
}
