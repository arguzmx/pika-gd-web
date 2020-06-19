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

  public menus$ = this.select(({ sesion }) => sesion.Menus);

  public uilocale$ = this.select(({ sesion }) => sesion.uilocale);

}
