import {LocalStorageService} from 'ngx-localstorage';
import { Injectable } from '@angular/core';
import { AppBusStore } from './app-bus-store';
import { AppBusQuery } from './app-bus-query';

export const APPBUS_STORAGE_NAME = 'appbus';

@Injectable({
    providedIn: 'root',
})
export class PreferenciasService {
    constructor(
        private query: AppBusQuery,
        private localStorage: LocalStorageService,
        private store: AppBusStore) {
            this.init();
    }

    private init(): void {

    }
}
