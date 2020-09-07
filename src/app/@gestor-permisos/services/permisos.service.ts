import { environment } from './../../../environments/environment.prod';
import { first } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, AsyncSubject } from 'rxjs';
import { Aplicacion } from '../../@pika/pika-module';

@Injectable()
export class PermisosService {

  constructor(private http: HttpClient) { }

  public ObtenerAplicaciones(): Observable<Aplicacion[]>{
    const appsubject = new AsyncSubject<Aplicacion[]>();
    const url = this.CrearEndpoint('sistema/seguridad/aplicaciones');

    this.http.get<Aplicacion[]>(url).pipe(first())
    .subscribe( aplicaciones => {
      appsubject.next(aplicaciones);
    },
    error => {
      appsubject.next([]);
    },
    () => {
      appsubject.complete();
    });
    return appsubject;
  }

  private CrearEndpoint(sufijo: string): string {
    return environment.apiUrl.replace(/\/$/, '') + '/' + sufijo;
  }

}

