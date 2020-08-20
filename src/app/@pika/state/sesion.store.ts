import { PikaSesionService } from './../pika-api/pika-sesion-service';
import { AuthService } from './../../@acceso/auth.service';
import { DominioActivo } from './../sesion/dominio-activo';
import { Sesion } from './sesion';
import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { NbMenuItem } from '@nebular/theme';
import { LocalStorageService } from 'ngx-localstorage';
import { IPreferencias } from './preferencias/i-preferencias';
import { MenuService, menus } from '../servicios/servicio-menu/menu-service';

export interface SesionState {
  sesion: Sesion | null;
  preferencias: IPreferencias | null;
}

export const PREF_STORAGE_NAME = 'preferencias';

export enum PropiedadesSesion {
  IdUsuario = 'IdUsuario',
  IdDominio = 'IdDominio',
  IdUnidadOrganizacional = 'IdUnidadOrganizacional',
  AvatarBase64 = 'AvatarBase64',
  token = 'token',
  Nombre = 'Nombre',
  isLoggedIn = 'isLoggedIn',
  Menus = 'Menus',
}



export function createInitialState(): SesionState {
  return {
    sesion: {
      IdUsuario: '',
      IdDominio: '',
      IdUnidadOrganizacional: '',
      AvatarBase64: '',
      token: '',
      Nombre: '',
      isLoggedIn: false,
      uilocale: 'es-MX',
      Dominios: [],
      Menus: menus,
    },
    preferencias: { Dominio: '', UnidadOrganizacional: ''}
  };
}


export function creaSesion(sesion: Sesion) {
  return { ...sesion };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'sesion' })
export class SesionStore extends Store<SesionState> {

  // Obtiene las preferncias desde el almacenamiento local
  private ObtienePreferencias(): IPreferencias {
    const p: IPreferencias = this.localStorage.get(PREF_STORAGE_NAME);
    if (p) {
        return p;
    } else {
        return {Dominio: '', UnidadOrganizacional: '' };
    }
  }

  constructor(
    private auth: AuthService,
    private localStorage: LocalStorageService,
    private service: PikaSesionService) {
    super(createInitialState());

    this.setPreferencias(this.ObtienePreferencias());

    auth.Autenticado$.subscribe((autenticado) => {
      this.setPropiedad(PropiedadesSesion.isLoggedIn, autenticado);
      if (autenticado) {
        this.setPropiedad(PropiedadesSesion.token, this.auth.accessToken);
        this.procesaUsuario();
      }
    });

    auth.userInfo$.subscribe((usuario) => {
      if (usuario) {
        this.setPropiedad(PropiedadesSesion.IdUsuario, usuario.sub);
      }
    });
  }



  private procesaUsuario() {
    if (this.getValue().sesion.isLoggedIn) {
      if (this.getValue().sesion.Dominios.length === 0) {
        this.service.GetDominios().subscribe((dominios) => {
          this.setDominios(dominios);

          let p = this.getValue().preferencias;
          let OrgValida: boolean = false;

          if (p.Dominio && p.UnidadOrganizacional) {
              const d  = dominios.find(x => x.Id === p.Dominio);
              if (d && (d.UnidadesOrganizacionales.find(
                x => x.Id === p.UnidadOrganizacional))) {
                // El dominio y la unidad orgaizacioal son válidos
                OrgValida = true;
              }
          }

          if (!OrgValida) {
            p = this.GetDefaultOrg(dominios);
            this.setOrganizacion(p.Dominio, p.UnidadOrganizacional);
          }

          this.setPropiedad(PropiedadesSesion.IdDominio, p.Dominio);
          this.setPropiedad(PropiedadesSesion.IdUnidadOrganizacional, p.UnidadOrganizacional);

        });
      }
    }
  }


  private GetDefaultOrg(dominios: DominioActivo[]) : IPreferencias {
    const p = { ... this.getValue().preferencias};

    p.Dominio = '';
    p.UnidadOrganizacional = '';
    if (dominios.length > 0) {
      p.Dominio = dominios[0].Id;
      p.UnidadOrganizacional = '';
      if (dominios[0].UnidadesOrganizacionales &&
        dominios[0].UnidadesOrganizacionales.length > 0) {
          p.UnidadOrganizacional = dominios[0].UnidadesOrganizacionales[0].Id;
        }
    }
    return p;
  }

  setOrganizacion(dominioId:string, uoId:  string ) {
    const prefs = { ...this.getValue().preferencias };
    prefs.UnidadOrganizacional = uoId;
    prefs.Dominio = dominioId;
    this.setPreferencias(prefs);
  }

  setPreferencias(prefencias: IPreferencias): void {
    this.localStorage.set(PREF_STORAGE_NAME, prefencias);
    this.update({ preferencias: prefencias });
  }

  setDominios(dominios: DominioActivo[]) {
    const sesion = { ...this.getValue().sesion };
    sesion.Dominios = dominios;
    this.update({ sesion });
  }

  setPropiedad(propiedad: PropiedadesSesion, valor: any) {
    const sesion = { ...this.getValue().sesion };
    sesion[propiedad.toString()] = valor;
    this.update({ sesion });
  }

  setMenus(menus: NbMenuItem[]) {
    const sesion = { ...this.getValue().sesion };
    sesion.Menus = menus;
    this.update({ sesion });
  }

  login(IdUsuario: string, token: string) {
    const sesion = { ...this.getValue().sesion };
    sesion.IdUsuario = IdUsuario;
    sesion.token = token;
    sesion.isLoggedIn = true;
    this.update({ sesion });
  }

  logout() {
    this.update(createInitialState());
  }
}
