import { Injectable } from '@angular/core';

@Injectable()
export class CacheEntidadesService {

  public ClaveValorContextual(origen: string, propiedad: string, tranid: string): string {
    let clave = `${origen.toLowerCase()}.${propiedad.toLowerCase()}`;
    if (tranid) {
        clave = clave + `.${tranid.toLowerCase()}`;
    }
    return clave;
  }

  public ClaveInstancia(tipo: string, id: string): string {
    return `instancia-${tipo.toLowerCase()}-${id.toLowerCase()}`;
  }

  public ClaveFiltro(id: string): string {
    return `filtro-${id.toLowerCase()}`;
  }

  public ClaveMetadatos(entidad: string): string {
    return `metadata-${entidad.toLowerCase()}`;
  }

  public ClaveEntidad(entidad: string, id: string ): string {
    return `entity-${entidad.toLowerCase()}-${id.toLowerCase()}`;
  }


  public ClaveLista(entidad: string, query: string ): string {
    return `list-${query.toLowerCase()}-${entidad.toLowerCase()}`;
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

  public print() {
    // console.log(this.items);
  }
}
