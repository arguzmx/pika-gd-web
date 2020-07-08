import { IPreferencias } from './i-preferencias';
import { Injectable } from '@angular/core';
import { StoreConfig, Store } from '@datorama/akita';

export interface PreferenciasState {
    preferencias: IPreferencias | null;
}

export function createInitialStatePreferencias(): PreferenciasState {
    return {
        preferencias: {
            Dominio: '',
        },
    };
}


@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'preferencias' })
export class PreferenciasStore extends Store<PreferenciasState> {

    constructor() {
        super(createInitialStatePreferencias());
    }
}
