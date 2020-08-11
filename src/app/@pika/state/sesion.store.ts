import { DominioActivo } from './../sesion/dominio-activo';
import { Sesion } from './sesion';
import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { NbMenuItem } from '@nebular/theme';

export interface SesionState {
  sesion: Sesion | null;
}

export enum PropiedadesSesion {
  IdUsuario = 'IdUsuario',
  IdDominio = 'IdDominio',
  IdUnidadOrganizacional = 'IdUnidadOrganizacional',
  AvatarBase64 = 'AvatarBase64',
  token = 'token',
  Nombre = 'Nombre',
  isLoggedIn = 'isLoggedIn',
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
      Menus: [
        {
          title: 'Home',
          icon: 'home-outline',
          link: '/pages/iot-dashboard',
        },
        {
          title: 'OPCIONES',
          group: true,
        },
        {
          title: 'Configuración global',
          icon: 'map-outline',
          children: [
            {
              title: 'Dominios',
              link: '/pages/tabular/',
              queryParams: {tipo: 'dominio', id: '', sub: ''},
            },
            {
              title: 'Unidades organizacionales',
              link: '/pages/tabular/',
              queryParams: {tipo: 'unidadorganizacional'},
            },
            {
              title: 'Roles',
              link: '/pages/tabular/',
              queryParams: {tipo: 'rol'},
            },
            {
              title: 'Volumenes',
              link: '/pages/tabular/',
              queryParams: {tipo: 'volumen', id: '', sub: ''},
            },
            {
              title: 'Usuarios',
              link: '/pages/tabular/',
              queryParams: {tipo: 'propiedadesusuario'},
            },
          ],
        },
        {
          title: 'Gestión documental',
          icon: 'archive-outline',
          children: [
            {
              title: 'Cuadros de clasificación',
              link: '/pages/tabular/',
              queryParams: {tipo: 'cuadroclasificacion'},
            },
            {
              title: 'Editor Cuadros',
              link: '/pages/jerarquia/',
              queryParams: {tipo: 'ElementoClasificacion', id: '', sub: ''},
            },
          ],
        },
      ],
    },
  };
}

export function creaSesion(sesion: Sesion) {
  return { ...sesion };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'sesion' })
export class SesionStore extends Store<SesionState> {

  constructor() {
    super(createInitialState());
  }


  setDominios(dominios: DominioActivo[]) {
    const sesion = {... this.getValue().sesion};
    sesion.Dominios = dominios;
    this.update({ sesion });
  }

  setPropiedad(propiedad: PropiedadesSesion, valor: any) {
    const sesion = {... this.getValue().sesion};
    sesion[propiedad.toString()] = valor;
    this.update({ sesion });
  }

  setMenus(menus: NbMenuItem[]) {
    const sesion = {... this.getValue().sesion};
    sesion.Menus = menus;
    this.update({ sesion });
  }

  login(IdUsuario: string, token: string ) {
    const sesion = {... this.getValue().sesion};
    sesion.IdUsuario = IdUsuario;
    sesion.token = token;
    sesion.isLoggedIn = true;
    this.update({ sesion });
  }

  logout() {
    this.update(createInitialState());
  }
}
