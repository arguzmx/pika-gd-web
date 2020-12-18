import { Propiedad } from '../../@pika/pika-module';
import { FormGroup } from '@angular/forms';
import { ConfiguracionEntidad } from './configuracion-entidad';

export interface ICampoEditable {
  propiedad: Propiedad;
  group: FormGroup;
  isUpdate: boolean;
  transaccionId: string;
}
