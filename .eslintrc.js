{
  // Establece Prettier como el formateador por defecto para los archivos soportados
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // Activa el formateo automático al guardar el archivo
  "editor.formatOnSave": true,

  // Activa las acciones de código de ESLint al guardar
  // Esto hará que ESLint corrija automáticamente todo lo que pueda (ej. quitar imports no usados)
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}