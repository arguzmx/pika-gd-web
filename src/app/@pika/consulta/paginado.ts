import { PropiedadesExtendidas } from "./propiedades-extendidas";

/** Extrcutura para el paginado de listas de elementos */
export class Paginado<T> {
  Desde: number;
  Indice: number;
  Tamano: number;
  ConteoTotal: number;
  Paginas: number;
  Elementos: T[];
  TienePrevio: boolean;
  TieneSiguiente: boolean;
  PropiedadesExtendidas?: PropiedadesExtendidas;
}
