// src/common/cloudinary/cloudinary.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  //   UploadApiErrorResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          // Si cloudinary devuelve un error, rechazamos la promesa.
          if (error) {
            return reject(new InternalServerErrorException(error.message));
          }
          // Si no hay error, pero el resultado no es válido, también es un error.
          if (!result) {
            return reject(
              new InternalServerErrorException(
                'Cloudinary upload failed for an unknown reason.',
              ),
            );
          }
          // Solo si todo está bien, resolvemos la promesa con el resultado.
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
