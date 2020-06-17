import { ValidatorFn } from '@angular/forms';
import { ValorLista } from '../../../../@pika/metadata/valor-lista';

export interface ConfigCampo {
    Id: string;
    disabled?: boolean;
    label?: string;
    name: string;
    options?: string[];
    placeholder?: string;
    type: string;
    validation?: ValidatorFn[];
    value?: any;
    negCheckboxCtlId?: string;
    selOpCtlId?: string;
    secondValId?: string;
    listVal?: ValorLista[];
    listSort?: string;
    listValendpoint?: string;
}

