import { ParametrosConsulta } from './parametros-consulta';
import { FiltroConsulta, FiltroConsultaBackend } from './filtro-consulta';

export class Consulta extends ParametrosConsulta {
  FiltroConsulta: FiltroConsulta[] = [];
  IdCache?: string;
  IdSeleccion?: string;
}

export class ConsultaBackend extends ParametrosConsulta {
  Filtros: FiltroConsultaBackend[] = [];
  Ids: string[];
  IdCache?: string;
}
