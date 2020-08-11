export enum TipoDespliegueVinculo {
    Tabular = 1, Jerarquico = 2, GrupoCheckbox = 10, ListaMultiple = 20,
}


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