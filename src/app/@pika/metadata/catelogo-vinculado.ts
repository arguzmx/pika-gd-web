import { TipoDespliegueVinculo } from './entidad-vinculada';

export interface CatalogoVinculado {
      EntidadCatalogo: string;
      IdCatalogo: string;
      IdEntidad: string;
      IdCatalogoMap: string;
      IdEntidadMap: string;
      EntidadVinculo: string;
      Despliegue: TipoDespliegueVinculo;
      PropiedadReceptora: string;
}