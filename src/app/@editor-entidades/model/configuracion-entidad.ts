import { PermisoAplicacion } from './../../@pika/seguridad/permiso-aplicacion';
import { TipoDespliegueVinculo } from '../../@pika/pika-module';

export interface ConfiguracionEntidad {
  // especifica el tipo de entidad en edición
  TipoEntidad: string;

  // Determina el tipo de origen para entidades relacionadas
  OrigenTipo: string;

  // Determina identificador único de origen para entidades relacionadas
  OrigenId: string;

  // Identificadr unico para controlar el contexto de ejecución
  TransactionId: string;

  // Tipo de despliegue a implementar
  TipoDespliegue: TipoDespliegueVinculo;

  Permiso?: PermisoAplicacion;
}
