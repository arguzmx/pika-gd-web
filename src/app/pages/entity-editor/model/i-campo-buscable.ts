import { FiltroConsulta } from './../../../@pika/consulta/filtro-consulta';
import { ConfiguracionEntidad } from './configuracion-entidad';
import { Propiedad } from '../../../@pika/metadata';
import { FormGroup } from '@angular/forms';

export interface ICampoBuscable {
  propiedad: Propiedad;
  config: ConfiguracionEntidad;
  group: FormGroup;
  ctl1Id: string;
  ctl2Id: string;
  negCtlId: string;
  opCtlId: string;

  // Eventos del campo editable
  EstadoFiltro: any;
  EliminarFiltro: any;
}
