export enum PosicionCarga {
    al_inicio = 0,
    al_final = 1,
    en_posicion = 2
}

export interface TokenScanner{
  Id: number,
  Token: string,
  ElementoId: string,
  VersionId: string,
  Caducidad: Date,
  PosicionCarga: PosicionCarga,
  PosicionInicio: number
}

export interface TokenScannerRequest {
  ElementoId: string;
  VersionId: string;
  Posicion: PosicionCarga;
  PosicionInicio: number;
}
