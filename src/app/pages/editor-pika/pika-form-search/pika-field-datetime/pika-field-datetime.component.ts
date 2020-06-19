import { Propiedad } from './../../../../@pika/metadata/propiedad';
import { CampoBuscable, CTL_OP_PREFIX, CTL_NEG_PREFIX, CTL1_PREFIX, CTL2_PREFIX } from './../../model/campo';
import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TextpOperador } from './../../../../@pika/consulta/texto-operador';
import { OperadoresBusqueda } from '../../../../@pika/consulta/operadores-busqueda';
import { Operacion } from '../../../../@pika/consulta/operacion';
import { tDate, tTime } from '../../../../@pika/metadata';
import { SearchFieldBase } from '../search-fields/search-field-base';
import { isDate, formatISO } from 'date-fns';
import { EditorService } from '../../services/editor-service';

@Component({
  selector: 'ngx-pika-field-datetime',
  templateUrl: './pika-field-datetime.component.html',
  styleUrls: ['./pika-field-datetime.component.scss'],
})
export class PikaFieldDatetimeComponent extends SearchFieldBase
  implements OnInit, CampoBuscable {
  @ViewChild('dt1') date1: any;
  @ViewChild('dt2') date2: any;

  isBetween: boolean = false;
  operadores: TextpOperador[] = OperadoresBusqueda.FechaHora();
  config: Propiedad;
  group: FormGroup;
  isDateTime: boolean = true;
  isDate: boolean = false;
  isTime: boolean = false;

  constructor(editorService: EditorService) {
    super(editorService);
  }
  ctl1Id: string;
  ctl2Id: string;
  negCtlId: string;
  opCtlId: string;

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

    this.setValorString(null);
    this.setValidIcon(valid);
    if (valid) {

      if (this.filtro.Operador === Operacion.OP_BETWEN.toString()) {
        this.setValorString(formatISO(this.filtro.Valor[0]) + ',' +  formatISO(this.filtro.Valor[1]));
      } else {
        this.setValorString(formatISO(this.filtro.Valor[0]));
      }

      this.editorService.AgregarFiltro(this.filtro);

    } else {
      this.editorService.InvalidarFiltro(this.filtro);
    }
  }

  closeFilter(): void {
    this.editorService.EliminarFiltro(this.config);
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
    this.filtro.Id = this.config.Id;

    this.opCtlId = CTL_OP_PREFIX + this.config.Id;
    this.negCtlId = CTL_NEG_PREFIX + this.config.Id;
    this.ctl1Id = CTL1_PREFIX + this.config.Id;
    this.ctl2Id = CTL2_PREFIX + this.config.Id;

    switch (this.config.TipoDatoId ) {
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
