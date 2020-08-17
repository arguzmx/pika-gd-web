import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { AppBusState, AppBusStore } from './app-bus-store';

@Injectable({ providedIn: 'root' })
export class AppBusQuery extends Query<AppBusState> {
  constructor(protected store: AppBusStore) {
    super(store);
  }

  public AppBus$ = this.select(({ AppBus }) => AppBus);

}
