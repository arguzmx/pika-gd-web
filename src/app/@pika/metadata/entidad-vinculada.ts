export enum TipoCardinalidad {
  UnoVarios = 0,
  UnoUno = 1,
}

export enum TipoDespliegueVinculo {
  Tabular = 1, Jerarquico = 2, EntidadUnica = 3, GrupoCheckbox = 10, ListaMultiple = 20,
  Membresia = 30,
}


export interface DiccionarioEntidadVinculada {
  Id: string;
  Enidad: string;
}

export interface EntidadVinculada {
  Cardinalidad: TipoCardinalidad;
  EntidadHijo: string;
  PropiedadPadre: string;
  PropiedadHijo: string;
  TipoDespliegue: TipoDespliegueVinculo;
  Etiqueta: string;
  HijoDinamico: boolean;
  PropiedadIdMiembro: string;
  DiccionarioEntidadesVinculadas: DiccionarioEntidadVinculada[];
}
