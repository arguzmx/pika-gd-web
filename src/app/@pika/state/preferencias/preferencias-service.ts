import { IPreferencias } from './i-preferencias';
import { PreferenciasStore } from './preferencias-store'
import {LocalStorageService} from 'ngx-localstorage';
import { PreferenciasQuery } from './preferencias-query';
import { Injectable } from '@angular/core';

export const PREF_STORAGE_NAME = 'preferencias';

@Injectable({
    providedIn: 'root',
})
export class PreferenciasService {
    constructor(
        private query: PreferenciasQuery,
        private localStorage: LocalStorageService,
        private store: PreferenciasStore) {
            this.init();
    }

    setDominio(dominio: string) {
      this.store.update({ preferencias: { Dominio: dominio} });
      this.UpdatePrefs();
    }

    getDominio(): string {
        const p: IPreferencias = this.localStorage.get(PREF_STORAGE_NAME);
        return p ? (p.Dominio ? p.Dominio : '') : '';
    }

    private UpdatePrefs(): void {
        this.localStorage.set(PREF_STORAGE_NAME, this.store.getValue().preferencias);
    }

    private init(): void {

    }
}
