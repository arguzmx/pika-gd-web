import { Component, OnInit, OnChanges } from '@angular/core';
import { Campo, ConfigCampo } from '../search-fields/search-fields.directive';
import { FormGroup } from '@angular/forms';
import { TextpOperador } from './../../../../@pika/consulta/texto-operador';
import { OperadoresBusqueda } from '../../../../@pika/consulta/operadores-busqueda';
import { FormSearchService } from '../form-search-service';
import { SearchFieldBase } from '../search-fields/search-field-base';

@Component({
  selector: 'ngx-pila-field-string',
  styleUrls: ['./pila-field-string.component.scss'],
  templateUrl: './pila-field-string.component.html',
})
export class PikaFieldStringComponent extends SearchFieldBase implements OnInit, Campo {

  operadores: TextpOperador[] = OperadoresBusqueda.Texto();
  config: ConfigCampo;
  group: FormGroup;

  constructor(searchService: FormSearchService) {
    super(searchService);
  }

  verificaFiltro(): void {
    let valid: boolean = true;
    if (this.filtro.Operador == null) valid = false;

    if (valid) {
      if(this.filtro.Valor.length === 0) {
        valid = false;
      } else {
        if ( (this.filtro.Valor[0] ===null) || (this.filtro.Valor[0] === '' )) {
          valid = false;
        }
      }
    }

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


  valor1(valor): void {
    this.inputChange(valor.srcElement.value);
  }


  ngOnInit(): void {
    this.filtro.Propiedad = this.config.Id;
    this.filtro.Id = this.config.name;
  }
}
