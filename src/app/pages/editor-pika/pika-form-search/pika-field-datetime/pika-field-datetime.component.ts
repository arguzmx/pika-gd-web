import {
  Component,
  OnInit,
  OnChanges,
  SimpleChange,
  ViewChild,
} from '@angular/core';
import { Campo } from '../search-fields/search-fields.directive';
import { ConfigCampo } from '../search-fields/config-campo';
import { FormGroup } from '@angular/forms';
import { TextpOperador } from './../../../../@pika/consulta/texto-operador';
import { OperadoresBusqueda } from '../../../../@pika/consulta/operadores-busqueda';
import { Operacion } from '../../../../@pika/consulta/operacion';
import { tDate, tTime } from '../../../../@pika/metadata';
import { FormSearchService } from '../form-search-service';
import { SearchFieldBase } from '../search-fields/search-field-base';
import { isDate } from 'date-fns';
@Component({
  selector: 'ngx-pika-field-datetime',
  templateUrl: './pika-field-datetime.component.html',
  styleUrls: ['./pika-field-datetime.component.scss'],
})
export class PikaFieldDatetimeComponent extends SearchFieldBase
  implements OnInit, Campo {
  @ViewChild('dt1') date1: any;
  @ViewChild('dt2') date2: any;

  isBetween: boolean = false;
  operadores: TextpOperador[] = OperadoresBusqueda.FechaHora();
  config: ConfigCampo;
  group: FormGroup;
  isDateTime: boolean = true;
  isDate: boolean = false;
  isTime: boolean = false;

  constructor(searchService: FormSearchService) {
    super(searchService);
  }

  verificaFiltro(): void {
    let valid: boolean = true;
    if (this.filtro.Operador == null) valid = false;

    if (valid) {
      if (this.filtro.Operador === Operacion.OP_BETWEN.toString()) {
        if (this.filtro.Valor.length < 2) {valid = false; }else {
        valid = isDate(this.filtro.Valor[0]) && isDate(this.filtro.Valor[1]);
        }
      } else {
        valid = isDate(this.filtro.Valor[0]);
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

  fecha1(event) {
    if (this.date1._selected) this.inputChange(this.date1._selected);
  }

  fecha2(event) {
    if (this.date2._selected) this.input2Change(this.date2._selected);
  }

  toggleBetween(value) {
    this.isBetween = value === Operacion.OP_BETWEN.toString() ? true : false;
    this.opChange(value);
  }

  ngOnInit(): void {
    this.filtro.Propiedad = this.config.Id;
    this.filtro.Id = this.config.name;
    switch (this.config.type) {
      case tDate:
        this.isDateTime = false;
        this.isDate = true;
        break;

      case tTime:
        this.isDateTime = false;
        this.isTime = true;
        break;
    }
  }
}
