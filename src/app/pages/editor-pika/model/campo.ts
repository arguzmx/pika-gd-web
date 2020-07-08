import { Propiedad } from './../../../@pika/metadata/propiedad';
import { FormGroup } from '@angular/forms';

export const CTL_NEG_PREFIX = 'neg-';
export const CTL_OP_PREFIX = 'op-';
export const CTL1_PREFIX = 'ctl1-';
export const CTL2_PREFIX = 'ctl2-';

export interface CampoBuscable {
  config: Propiedad;
  group: FormGroup;
  ctl1Id: string;
  ctl2Id: string;
  negCtlId: string;
  opCtlId: string;
}

export interface CampoEditable {
  config: Propiedad;
  group: FormGroup;
  isUpdate: boolean;
}
