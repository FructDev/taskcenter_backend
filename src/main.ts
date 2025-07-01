// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // NOTA PROFESIONAL: Habilitar un prefijo global para la API
  // Todas las rutas de nuestra API ahora comenzarán con /api/v1 (ej. http://localhost:3001/api/v1/tasks)
  // Esto es una buena práctica para el versionado de la API.
  app.setGlobalPrefix('api/v1');

  // NOTA PROFESIONAL: Habilitar CORS (Cross-Origin Resource Sharing)
  // Permite que nuestro frontend (que estará en un dominio diferente) se comunique con esta API.
  app.enableCors({
    origin: true, // En producción, deberías poner aquí la URL de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // NOTA PROFESIONAL: Habilitar el ValidationPipe de forma global
  // Esto activa la validación automática para todos los DTOs que lo requieran.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve cualquier propiedad que no esté definida en el DTO.
      forbidNonWhitelisted: true, // Lanza un error si se reciben propiedades no definidas en el DTO.
      transform: true, // Transforma los datos de entrada a su tipo de DTO correspondiente.
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Aplicación corriendo en el puerto ${port}`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
