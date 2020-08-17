import { DominioActivo } from './../../sesion/dominio-activo';
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

    setOrganizacion(dominio: string, unidad: string) {
      const prefs = { ...this.store.getValue().preferencias};
      prefs.Dominio = dominio;
      prefs.UnidadOrganizacional = unidad;
      this.store.update({ preferencias: prefs });
      this.UpdatePrefs();
    }

    getORganizacion(): IPreferencias {
        const p: IPreferencias = this.localStorage.get(PREF_STORAGE_NAME);
        if (p) {
            return p;
        } else {
            return {Dominio: '', UnidadOrganizacional: '' };
        }
    }

    private UpdatePrefs(): void {
        this.localStorage.set(PREF_STORAGE_NAME, this.store.getValue().preferencias);
    }

    private init(): void {

    }
}
