export enum TipoCardinalidad {
  UnoVarios = 0,
  UnoUno = 1,
}

export class EntidadVinculada {
  Cardinalidad: TipoCardinalidad;
  Entidad: string;
  Padre: string;
  Hijo: string;
}
