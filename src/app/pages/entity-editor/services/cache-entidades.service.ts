import { Injectable } from '@angular/core';


@Injectable()
export class CacheEntidadesService {

  public ClaveInstancia(tipo: string, id: string): string {
    return `instancia-${tipo.toLocaleLowerCase()}-${id.toLocaleLowerCase()}`;
  }

  public ClaveFiltro(id: string): string {
    return `filtro-${id.toLocaleLowerCase()}`;
  }

  public ClaveMetadatos(entidad: string): string {
    return `metadata-${entidad.toLocaleLowerCase()}`;
  }

  public ClaveLista(entidad: string, query: string ): string {
    return `list-${query.toLocaleLowerCase()}-${entidad.toLocaleLowerCase()}`;
  }

  items = {};
  constructor() {
    this.items = {};
  }
  public clear() {
    this.items = {};
  }
  public has(key: string) {
    return key.toLowerCase() in this.items;
  }
  public set(key: string, value: any) {
    this.items[key.toLowerCase()] = value;
  }
  public get(key: string) {
    return this.items[key.toLowerCase()];
  }
  public delete(key: string) {
    if (this.has(key)) {
      delete this.items[key.toLowerCase()];
      return true;
    }
    return false;
  }

}
