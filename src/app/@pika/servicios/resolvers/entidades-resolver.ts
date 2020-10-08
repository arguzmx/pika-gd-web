import { SesionStore } from './../../state/sesion.store';
import { HttpClient } from '@angular/common/http';
import { PikaApiService } from './../../pika-api/pika-api.service';
import { SesionQuery } from './../../state/sesion.query';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

// Proceso los elementos requeridos para la gestion de etidades
@Injectable({ providedIn: 'root' })
export class EntidadesResolver implements Resolve<any> {
  constructor(
    private htpp: HttpClient,
    private sessionQ: SesionQuery,
    private sessionS: SesionStore) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<any> | Promise<any> | any {

        // Obtiene las rutas en el server para las entidades
        if ( this.sessionQ.RutasEntidades.length === 0 ) {
            const service = new  PikaApiService<any, any>(this.sessionQ, this.htpp);
            return service.ObtieneRutas();
        } else {
            return this.sessionQ.RutasEntidades;
        }
  }
}
