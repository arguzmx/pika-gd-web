import { Propiedad } from './../../../@pika/metadata/propiedad';
import { FormGroup } from '@angular/forms';
import { ConfiguracionEntidad } from './configuracion-entidad';

export interface ICampoEditable {
  propiedad: Propiedad;

  group: FormGroup;

  isUpdate: boolean;

  congiguracion: ConfiguracionEntidad;

}
