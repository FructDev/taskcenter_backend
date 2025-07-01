// src/tasks/dto/create-comment.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'El comentario debe ser un texto' })
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  text: string;
}
