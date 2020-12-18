import { AppLogService } from './../servicios/app-log/app-log.service';
import { DominioActivo } from './../sesion/dominio-activo';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { retry, first } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ACLUsuario } from '../seguridad';
import { MenuAplicacion } from '../aplicacion';
import { environment } from '../../../environments/environment';

const retryCount: number = 1;

@Injectable({
  providedIn: 'root',
})

export class PikaSesionService {

  MENU = 'menu';
  ACl = 'acl';
  DOMINIOS = 'dominios';

  constructor(
    private log: AppLogService,
    private http: HttpClient,
  ) {

  }


  // Obtiene la lista de permisos de ACL para el usuario
  public ObtieneACL(): Observable<ACLUsuario> {
    const url = this.CrearEndpoint(this.ACl);
    return this.http.get<ACLUsuario>(url);
  }

  // Obtiene la lista de permisos de ACL para el usuario
  public ObtieneMenu(): Observable<MenuAplicacion> {
    const url = this.CrearEndpoint(this.MENU);
    return this.http.get<MenuAplicacion>(url);
  }

  public GetDominios(): Observable<DominioActivo[]> {
    const url = this.CrearEndpoint(this.DOMINIOS);
    return this.http.get<DominioActivo[]>(url)
      .pipe(
        retry(retryCount),
        first(),
      );
  }

  // Genera el endpoint para la función del perfil
  private CrearEndpoint(Tipo: string): string {
    let url = environment.pikaApiUrl.replace(/\/$/, '') + '/' +
      'api/v' + environment.apiVersion + '/usuario/Perfil/';

    switch (Tipo) {
      case this.ACl:
        url = url + 'acl';
        break;

      case this.MENU:
        url = url + 'menu/pika';
        break;

      case this.DOMINIOS:
        url = url + 'dominios';
        break;
    }
    return url;
  }



}
