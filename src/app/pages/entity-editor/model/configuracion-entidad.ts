import { MetadataInfo } from './../../../@pika/metadata/metadata-info';
export interface ConfiguracionEntidad {
  // especifica el tipo de entidad en edición
  TipoEntidad: string;

  // Determina el tipo de origen para entidades relacionadas
  OrigenTipo: string;

  // Determina identificador único de origen para entidades relacionadas
  OrigenId: string;

  // Identificadr unico para controlar el contexto de ejecución
  TransactionId: string;
}
