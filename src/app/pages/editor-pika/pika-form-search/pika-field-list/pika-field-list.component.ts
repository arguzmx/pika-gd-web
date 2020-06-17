import { ValorLista } from './../../../../@pika/metadata/valor-lista';
import { Component, OnInit } from '@angular/core';
import { Campo } from '../search-fields/search-fields.directive';
import { ConfigCampo } from '../search-fields/config-campo';
import { FormGroup } from '@angular/forms';
import { TextpOperador } from './../../../../@pika/consulta/texto-operador';
import { OperadoresBusqueda } from '../../../../@pika/consulta/operadores-busqueda';
import { FormSearchService } from '../form-search-service';
import { SearchFieldBase } from '../search-fields/search-field-base';

@Component({
  selector: 'ngx-pika-field-list',
  templateUrl: './pika-field-list.component.html',
  styleUrls: ['./pika-field-list.component.scss'],
})
export class PikaFieldListComponent extends SearchFieldBase  implements  OnInit, Campo {

  operadores: TextpOperador[] = OperadoresBusqueda.Lista();
  config: ConfigCampo;
  group: FormGroup;
  list: ValorLista[];

  constructor(searchService: FormSearchService) {
    super(searchService);
  }

  verificaFiltro(): void {
    let valid: boolean = true;
    if (this.filtro.Valor.length === 0) valid = false;
    if (this.filtro.Operador == null) valid = false;

    this.setValidIcon(valid);
    if (valid) {
      this.searchService.AgregarFiltro(this.filtro);
    } else {
      this.searchService.InvalidarFiltro(this.filtro);
    }

  }


  closeFilter(): void {
    this.searchService.EliminarFiltro(this.config);
  }

  ngOnInit(): void {
    this.filtro.Propiedad = this.config.Id;
    this.filtro.Id = this.config.name;

    if (this.config.listSort === 'index') {
      this.list = this.Sort('Indice');
    } else {
      this.list = this.Sort('Texto');
    }
  }

  Sort(by: string) {
    return this.config.listVal.sort((obj1, obj2) => {
      if (obj1[by] > obj2[by]) {
          return 1;
      }
      if (obj1[by] < obj2[by]) {
          return -1;
      }
      return 0;
  });
  }

}
