export enum TipoCardinalidad {
  UnoVarios = 0,
  UnoUno = 1,
}

export interface EntidadVinculada {
  Cardinalidad: TipoCardinalidad;
  EntidadHijo: string;
  PropiedadPadre: string;
  PropiedadHijo: string;
}

export class NavegacionVinculada implements EntidadVinculada {

  constructor(vinculo: EntidadVinculada, EntidadPadre: string, InstanciaPadre: any) {
    this.Cardinalidad = vinculo.Cardinalidad;
    this.EntidadHijo = vinculo.EntidadHijo;
    this.PropiedadPadre = vinculo.PropiedadPadre;
    this.PropiedadHijo = vinculo.PropiedadHijo;
    this.InstanciaPadre = InstanciaPadre;
    this.EntidadPadre = EntidadPadre;
    }

  Cardinalidad: TipoCardinalidad;
  EntidadHijo: string;
  PropiedadPadre: string;
  PropiedadHijo: string;
  InstanciaPadre: any;
  EntidadPadre: string;
}
