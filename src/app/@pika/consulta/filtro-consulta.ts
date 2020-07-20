import { Operacion } from './operacion';

// Filtros para realizar la consulta
export class FiltroConsulta {
  constructor() {
    this.Negacion = false;
  }

  Id?: string;

  // Indica si la condición debe manejarse como una negación
  Negacion: boolean;

  // Nombre de la propiedad a filtrar
  Propiedad: string;

  // Debe corresponde con alguna de las constantes OP_XXX
  Operador: Operacion;

  // Valores para el filtro
  Valor: any[];

  // Valores serializados para la consulta de la API
  ValorString?: string;

  Valido?: boolean;

}
