// src/types/express/index.d.ts

import { UserDocument } from '../../users/entities/user.entity';

// Le decimos a TypeScript que vamos a modificar un módulo global
declare global {
  // Modificamos el namespace de Express
  namespace Express {
    // Inyectamos nuestra propiedad 'user' en la interfaz Request
    export interface Request {
      user?: UserDocument;
    }
  }
}
