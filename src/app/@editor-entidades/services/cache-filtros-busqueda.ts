import { Injectable } from "@angular/core";
import { FiltroConsulta } from "../../@pika/consulta";
import { CacheEntidadesService } from "./cache-entidades.service";


@Injectable()
export class CacheFiltrosBusqueda {
  constructor (private cache: CacheEntidadesService){

  }  
  
  // Cache de filtros
  // ---------------------------------------
  // ---------------------------------------
  public SetCacheFiltros(id: string, filtros: FiltroConsulta[]) {
    const key = this.cache.ClaveFiltro(id);
    this.cache.set(key, filtros);
  }

  public GetCacheFiltros(id: string): FiltroConsulta[] {
    const key = this.cache.ClaveFiltro(id);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    return [];
  }

}