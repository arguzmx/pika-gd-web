import { FiltroConsultaPropiedad } from './../../@pika/consulta/filtro.-consulta-propiedad';
import { Propiedad } from '../../@pika/pika-module';
import { FormGroup } from '@angular/forms';

export interface ICampoEditable {
  propiedad: Propiedad;
  group: FormGroup;
  isUpdate: boolean;
  transaccionId: string;
  filtrosQ: FiltroConsultaPropiedad[];
}
