import { AppLogService } from './../servicios/app-log/app-log.service';
import { environment } from './../../../environments/environment.prod';
import { DominioActivo } from './../sesion/dominio-activo';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { retry, first } from 'rxjs/operators';
import { Observable } from 'rxjs';

const retryCount: number = 1;

@Injectable({
  providedIn: 'root',
})

export class PikaSesionService {

    SesionEndpoint:  string;

    constructor(
      private log: AppLogService,
      private http: HttpClient,
    ) {
        this.SesionEndpoint = environment.apiUrl.replace(/\/$/, '') + '/'  + 'usuario/perfil/';
    }

    public GetDominios(): Observable<DominioActivo[]> {
       return this.http.get<DominioActivo[]>(this.SesionEndpoint + 'dominios')
       .pipe(
        retry(retryCount),
        first(),
      );
    }

}
