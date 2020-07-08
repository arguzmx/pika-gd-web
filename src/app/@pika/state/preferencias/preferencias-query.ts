import { PreferenciasState, PreferenciasStore } from './preferencias-store';
import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';

@Injectable({ providedIn: 'root' })
export class PreferenciasQuery extends Query<PreferenciasState> {
  constructor(protected store: PreferenciasStore) {
    super(store);
  }

  public preferencias$ = this.select(({ preferencias }) => preferencias);

}
