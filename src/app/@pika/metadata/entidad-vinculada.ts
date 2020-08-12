export enum TipoCardinalidad {
  UnoVarios = 0,
  UnoUno = 1,
}

export enum TipoDespliegueVinculo {
   Tabular = 1, Jerarquico = 2, GrupoCheckbox = 10, ListaMultiple = 20,
}

export interface EntidadVinculada {
  Cardinalidad: TipoCardinalidad;
  EntidadHijo: string;
  PropiedadPadre: string;
  PropiedadHijo: string;
  TipoDespliegue: TipoDespliegueVinculo;
  Etiqueta: string;
}

export class NavegacionVinculada implements EntidadVinculada {

  constructor(vinculo: EntidadVinculada, EntidadPadre: string, InstanciaPadre: any) {
    this.Cardinalidad = vinculo.Cardinalidad;
    this.EntidadHijo = vinculo.EntidadHijo;
    this.PropiedadPadre = vinculo.PropiedadPadre;
    this.PropiedadHijo = vinculo.PropiedadHijo;
    this.InstanciaPadre = InstanciaPadre;
    this.EntidadPadre = EntidadPadre;
    this.TipoDespliegue = vinculo.TipoDespliegue;
    this.Etiqueta = vinculo.Etiqueta;
    }

  Cardinalidad: TipoCardinalidad;
  EntidadHijo: string;
  PropiedadPadre: string;
  PropiedadHijo: string;
  InstanciaPadre: any;
  EntidadPadre: string;
  TipoDespliegue: TipoDespliegueVinculo;
  Etiqueta:  string;
}
