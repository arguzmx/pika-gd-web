import { Injectable } from '@angular/core';
import { FiltroIdentificado } from '../pika-form-search/search-fields/search-fields.directive';


@Injectable()
export class PikaQueryBuilderService {
  private filtros: FiltroIdentificado[] = [];
  constructor() {}

  get Filtros(): FiltroIdentificado[] {
    return this.filtros;
  }

  BorrarFiltros(): void {
    this.filtros = [];
  }

  CreaActualizaFiltro(filtro: FiltroIdentificado): void {
    const updateItem = this.filtros.filter(
      (x) => x.Propiedad === filtro.Propiedad,
    )[0];
    if (updateItem) {
      const index = this.filtros.indexOf(updateItem);
      this.filtros[index] = filtro;
    } else {
      this.filtros.push(filtro);
    }
  }

  EliminaFiltro(id: string): void {
    const updateItem = this.filtros.filter((x) => x.Propiedad === id)[0];
    if (updateItem) {
      const index = this.filtros.indexOf(updateItem);
      if (index > -1) {
        this.filtros.splice(index, 1);
      }
    }
  }
}
