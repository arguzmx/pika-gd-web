import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { SesionStore, SesionState } from './sesion.store';

@Injectable({ providedIn: 'root' })
export class SesionQuery extends Query<SesionState> {
  constructor(protected store: SesionStore) {
    super(store);
  }

  public sesion() {
    return this.getValue().sesion;
  }

  public sesion$ = this.select(({ sesion }) => sesion);

  public preferencias$ = this.select(({  preferencias }) => preferencias);

  public menus$ = this.select(state => state.sesion.MenuItems);
  
  public modoVisorActivado$ = this.select(state => state.sesion.ModoVisorActivado);

  

  public uilocale$ = this.select(({ sesion }) => sesion.uilocale);

  public dominioid$ = this.select(({ sesion }) => sesion.IdDominio);

  public dominios$ = this.select(({ sesion }) => sesion.Dominios);

  get dominios() {
    return this.getValue().sesion.Dominios;
  }

  get preferencias() {
    return this.getValue().preferencias;
  }

  get RutasEntidades() {
    // las rutas son obtenidas del backend desde ObtieneRutas() en la API
    return this.getValue().configuracion.RutasEntidades;
  }

  get ACL() {
    return this.getValue().sesion.ACL;
  }

}
