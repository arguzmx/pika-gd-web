import { PreferenciasStore } from './../state/preferencias/preferencias-store';
import { AppLogService } from './../servicios/app-log/app-log.service';
import { environment } from './../../../environments/environment.prod';
import { DominioActivo } from './../sesion/dominio-activo';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { retry, first } from 'rxjs/operators';
import { SesionStore } from '../state/sesion.store';

const retryCount: number = 1;

@Injectable({
  providedIn: 'root',
})

export class PikaSesinService {

    SesionEndpoint:  string;

    constructor(
      private log: AppLogService,
      private storeSesion: SesionStore,
      private http: HttpClient,
    ) {
        this.SesionEndpoint = environment.apiUrl.replace(/\/$/, '') + '/'  + 'usuario/perfil/';
    }

    GetDominios(): void {
        this.http.get<DominioActivo[]>(this.SesionEndpoint + 'dominios')
        .pipe(
          retry(retryCount),
          first(),
        ).subscribe( dominios => {
            this.storeSesion.setDominios(dominios);
        }, (err) => {
            this.log.Advertencia('', err);
        });
    }

}
