export enum AccionesCRUD {
  // No participa en ninguna acción crud
  none = 0,
  // Participa en acciones de lectura
  read = 1,
  // Participa en acciones de actualización
  write = 2,
  // Participa en acciones de eliminacion
  delete = 4,
  // Participa en acciones de adicion
  add = 8,
  // Participa en acciones de lectura, actualziacin y eliminacion
  rwd = 7,
  // Participa todas la acciones CRUD
  arwd = 15,
}
