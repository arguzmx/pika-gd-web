import { ParametrosConsulta } from './parametros-consulta';
import { Operacion } from './operacion';
import { FiltroConsulta } from './filtro-consulta';
import { TextpOperador } from './texto-operador';

export class Consulta extends ParametrosConsulta {
  static TextoOperacion(operador: Operacion, lang: string): TextpOperador {
    let texto = '';

    switch (operador) {
      case Operacion.OP_CONTAINS:
        texto = 'contiene';
        break;

      case Operacion.OP_ENDS:
        texto = 'termina con';
        break;

      case Operacion.OP_EQ:
        texto = 'igual';
        break;

      case Operacion.OP_EXIST:
        texto = 'existe';
        break;

      case Operacion.OP_GT:
        texto = 'mayor';
        break;

      case Operacion.OP_GTE:
        texto = 'mayor igual';
        break;

      case Operacion.OP_LT:
        texto = 'menor';
        break;

      case Operacion.OP_LTE:
        texto = 'menor igual';
        break;

      case Operacion.OP_STARTS:
        texto = 'comienza con';
        break;

      case Operacion.OP_BETWEN:
        texto = 'entre';
        break;

      case Operacion.OP_FULLTEXT:
        texto = 'texto';
        break;
    }

    const op = new TextpOperador();
    op.Operacion = operador.toString();
    op.Texto = texto;

    return op;
  }

  FiltroConsulta: FiltroConsulta[];
}
