import { Component, ViewChild, OnInit } from '@angular/core';
import { ICampoBuscable } from '../../../model/i-campo-buscable';
import { BuscadorEntidadesBase } from '../../../model/buscador-entidades-base';
import {  tDate, tTime } from '../../../../../@pika/metadata';
import { AppLogService } from '../../../../../@pika/servicios/app-log/app-log.service';
import { TranslateService } from '@ngx-translate/core';
import { EntidadesService } from '../../../services/entidades.service';
import { isDate, formatISO } from 'date-fns';
import { Operacion } from '../../../../../@pika/consulta';
import { CTL_OP_PREFIX, CTL_NEG_PREFIX, CTL1_PREFIX, CTL2_PREFIX } from '../../../model/constantes';

@Component({
  selector: 'ngx-datetime-search',
  templateUrl: './datetime-search.component.html',
  styleUrls: ['./datetime-search.component.scss'],
})
export class DatetimeSearchComponent extends BuscadorEntidadesBase
  implements OnInit, ICampoBuscable {
  @ViewChild('dt1') date1: any;
  @ViewChild('dt2') date2: any;

  isBetween: boolean = false;
  isDateTime: boolean = true;
  isDate: boolean = false;
  isTime: boolean = false;
  ops = [Operacion.OP_EQ, Operacion.OP_BETWEN, Operacion.OP_GT, Operacion.OP_GTE,
    Operacion.OP_LT, Operacion.OP_LTE];

    constructor(applog: AppLogService, translate: TranslateService, entidades: EntidadesService) {
      super(entidades, translate, applog);
    this.ts = ['ui.no'];
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

    this.setValorString(null);
    this.setValidIcon(valid);
    this.filtro.Valido = valid;
    if (valid) {

      if (this.filtro.Operador === Operacion.OP_BETWEN.toString()) {
        this.setValorString(formatISO(this.filtro.Valor[0]) + ',' +  formatISO(this.filtro.Valor[1]));
      } else {
        this.setValorString(formatISO(this.filtro.Valor[0]));
      }
    }

    this.EstadoFiltro.emit(this.filtro);
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
    this.ObtenerTraducciones();
    this.ObtenerOperadores(this.ops);

    this.filtro.Propiedad = this.propiedad.Id;
    this.filtro.Id = this.propiedad.Id;

    this.opCtlId = CTL_OP_PREFIX + this.propiedad.Id;
    this.negCtlId = CTL_NEG_PREFIX + this.propiedad.Id;
    this.ctl1Id = CTL1_PREFIX + this.propiedad.Id;
    this.ctl2Id = CTL2_PREFIX + this.propiedad.Id;

    switch (this.propiedad.TipoDatoId ) {
      case tDate:
        this.isDateTime = false;
        this.isDate = true;
        break;

      case tTime:
        this.isDateTime = false;
        this.isTime = true;
        break;
    }

    this.EstableceFltroDefault();
  }


}
