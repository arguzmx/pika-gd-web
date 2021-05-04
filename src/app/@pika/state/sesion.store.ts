import { AppConfig } from './../../app-config';
import { RutaTipo } from './configuracion/ruta-tipo';
import { PikaSesionService } from './../pika-api/pika-sesion-service';
import { DominioActivo } from './../sesion/dominio-activo';
import { Sesion } from './sesion';
import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { NbMenuItem } from '@nebular/theme';
import { LocalStorageService } from 'ngx-localstorage';
import { IPreferencias } from './preferencias/i-preferencias';
import { IConfiguracion } from './configuracion/i-configuracion';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ConstructorMenu } from '../aplicacion/constructor-menu';
import { OAuthErrorEvent, OAuthService, OAuthSuccessEvent } from 'angular-oauth2-oidc';
import { HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS } from '@angular/cdk/a11y/high-contrast-mode/high-contrast-mode-detector';

export interface SesionState {
  sesion: Sesion | null;
  preferencias: IPreferencias | null;
  configuracion: IConfiguracion | null;
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
  MenuItems = 'MenuItems',
  ACL = 'ACL',
  MenuApp = 'MenuApp',
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
      MenuItems: [],
      MenuApp: null,
      ACL: null,
    },
    preferencias: { Dominio: '', UnidadOrganizacional: '' },
    configuracion: { RutasEntidades: [] },
  };
}


export function creaSesion(sesion: Sesion) {
  return { ...sesion };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'sesion' })
export class SesionStore extends Store<SesionState> {

  private GetUserInfo:boolean =true;

  // Obtiene las preferncias desde el almacenamiento local
  private ObtienePreferencias(): IPreferencias {
    const p: IPreferencias = this.localStorage.get(PREF_STORAGE_NAME);
    if (p) {
      return p;
    } else {
      return { Dominio: '', UnidadOrganizacional: '' };
    }
  }

  constructor(
    private app: AppConfig,
    private auth: OAuthService,
    private localStorage: LocalStorageService,
    private serviceSesion: PikaSesionService) {
    super(createInitialState());

    const prefs = this.ObtienePreferencias();
    this.setPreferencias(prefs);
    
    this.auth.setupAutomaticSilentRefresh();
    
    window.addEventListener('storage', (event) => {

      // The `key` is `null` if the event was caused by `.clear()`
      if (event.key !== 'access_token' && event.key !== null) {
        return;
      }

    });

    this.auth.events.subscribe(event => {
      if (event instanceof OAuthSuccessEvent) {

        if (this.auth.hasValidAccessToken()){

          this.setPropiedad(PropiedadesSesion.isLoggedIn, true);
          this.setPropiedad(PropiedadesSesion.token, this.auth.getAccessToken());
          this.procesaUsuario();

          if(this.GetUserInfo) {
            this.GetUserInfo = false;
            this.auth.loadUserProfile().then(u=>{
              // console.log(u);
            });
          }

        } else {
          console.error("Invalid access token");
          window.location.reload();
          //this.auth.silentRefresh();
        }
      }

      // if (event instanceof OAuthErrorEvent ) {
      // }
      
      
    });
  }


  private ObtieneDominios() {
    if (this.getValue().sesion.Dominios.length === 0) {
      this.serviceSesion.GetDominios().subscribe((dominios) => {
        this.setDominios(dominios);

        let p = this.getValue().preferencias;
        let OrgValida: boolean = false;

        if (p.Dominio && p.UnidadOrganizacional) {
          const d = dominios.find(x => x.Id === p.Dominio);
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

  private ObtieneMenu() {
    if ((!(this.getValue().sesion.ACL)) ||
      (!(this.getValue().sesion.MenuApp))) {
      forkJoin({
        acl: this.serviceSesion.ObtieneACL().pipe(first()),
        menu: this.serviceSesion.ObtieneMenu().pipe(first()),
      })
        .subscribe(data => {

          const cm: ConstructorMenu = new  ConstructorMenu;
          const menu = cm.CreaMenu(data.menu, data.acl);


          this.setPropiedad(PropiedadesSesion.MenuItems, menu);
          this.setPropiedad(PropiedadesSesion.ACL, data.acl);
          this.setPropiedad(PropiedadesSesion.MenuApp, data.menu);

        }
          , (e) => {}, () => {} );
    }
  }

  private procesaUsuario() {
    if (this.getValue().sesion.isLoggedIn) {
        this.ObtieneDominios();
        this.ObtieneMenu();
    }
  }


  private GetDefaultOrg(dominios: DominioActivo[]): IPreferencias {
    const p = { ... this.getValue().preferencias };

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

  setRutasTipo(rutas: RutaTipo[]) {
    const conf = { ...this.getValue().configuracion };
    conf.RutasEntidades = rutas;
    this.update({ configuracion: conf });
  }


  setOrganizacion(dominioId: string, uoId: string) {
    const prefs = { ...this.getValue().preferencias };
    prefs.UnidadOrganizacional = uoId;
    prefs.Dominio = dominioId;
    this.setPreferencias(prefs);
  }

  setPreferencias(prefencias: IPreferencias): void {
    this.localStorage.set(PREF_STORAGE_NAME, prefencias);
    this.setPropiedad(PropiedadesSesion.IdUnidadOrganizacional, prefencias.UnidadOrganizacional);
    this.setPropiedad(PropiedadesSesion.IdDominio, prefencias.Dominio);
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

  setMenus(menu: NbMenuItem[]) {
    const sesion = { ...this.getValue().sesion };
    sesion.MenuItems = menu;
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
