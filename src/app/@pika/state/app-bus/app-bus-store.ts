import { Injectable } from '@angular/core';
import { StoreConfig, Store } from '@datorama/akita';
import { IAppBus } from './iapp-bus';

export enum PropiedadesBus {
    CambiarOrganizacion = 'CambiarOrganizacion',
}

export interface AppBusState {
    AppBus: IAppBus | null;
}

export function createInitialStateAppBus(): AppBusState {
    return {
        AppBus: {
            CambiarOrganizacion: false,
        },
    };
}


@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'appbus' })
export class AppBusStore extends Store<AppBusState> {

    setPropiedadAppBus(propiedad: PropiedadesBus, valor: any) {
        const appbus = {... this.getValue().AppBus};
        appbus[propiedad.toString()] = valor;
        this.update({ AppBus: appbus });
      }
    constructor() {
        super(createInitialStateAppBus());
    }
}
