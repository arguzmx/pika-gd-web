import { CacheFiltrosBusqueda } from './../../../services/cache-filtros-busqueda';
import { BuscadorEntidadesBase } from '../../../model/buscador-entidades-base';
import { ICampoBuscable } from '../../../model/i-campo-buscable';
import { tDouble, tInt64, tInt32 } from '../../../../@pika/pika-module';
import { Operacion } from '../../../../@pika/pika-module';
import { AppLogService } from '../../../../@pika/pika-module';
import { TranslateService } from '@ngx-translate/core';
import { EntidadesService } from '../../../services/entidades.service';
import { Component, OnInit } from '@angular/core';
import { CTL_OP_PREFIX, CTL_NEG_PREFIX, CTL1_PREFIX, CTL2_PREFIX } from '../../../model/constantes';
import { Traductor } from '../../../services/traductor';

@Component({
  selector: 'ngx-numeric-search',
  templateUrl: './numeric-search.component.html',
  styleUrls: ['./numeric-search.component.scss'],
})
export class NumericSearchComponent extends BuscadorEntidadesBase implements OnInit,
ICampoBuscable {
  isBetween: boolean = false;
  mask: string = 'separator.4';
  negativos: boolean = true;
  public T: Traductor;
  ops = [Operacion.OP_EQ, Operacion.OP_BETWEN, Operacion.OP_GT, Operacion.OP_GTE,
    Operacion.OP_LT, Operacion.OP_LTE];

    constructor(applog: AppLogService, translate: TranslateService, cache: CacheFiltrosBusqueda) {
      super(cache, translate);
      this.T = new Traductor(translate);
      this.T.ts = ['ui.no'];
  }


  verificaFiltro(): void {
    let valid: boolean = true;
    if (this.filtro.Operador == null) valid = false;

    if (valid) {
      if (this.filtro.Operador === Operacion.OP_BETWEN.toString()) {
        if (this.filtro.Valor.length < 2) {
          valid = false;
        } else {
          valid = !(isNaN(this.filtro.Valor[0]) || isNaN(this.filtro.Valor[1]));
        }
      } else {
        valid = !isNaN(this.filtro.Valor[0]);
      }
    }
    this.setValorString(null);
    this.setValidIcon(valid);
    this.filtro.Valido = valid;
    if (valid) {
      if (this.filtro.Operador === Operacion.OP_BETWEN.toString()) {
        this.setValorString(this.filtro.Valor[0] + ',' + this.filtro.Valor[1]);
      } else {
        this.setValorString(this.filtro.Valor[0]);
      }
    }
    this.EstadoFiltro.emit(this.filtro);
  }

  toggleBetween(value) {
    this.isBetween = value === Operacion.OP_BETWEN.toString() ? true : false;
    this.opChange(value);
  }

  valor1(valor): void {
    this.inputChange(valor.srcElement.value);
  }

  valor2(valor): void {
    this.input2Change(valor.srcElement.value);
  }
  ngOnInit(): void {

    this.T.ObtenerTraducciones();
    this.ObtenerOperadores(this.ops);

    this.filtro.Propiedad = this.propiedad.Id;
    this.filtro.Id = this.propiedad.Id;

    this.opCtlId = CTL_OP_PREFIX + this.propiedad.Id;
    this.negCtlId = CTL_NEG_PREFIX + this.propiedad.Id;
    this.ctl1Id = CTL1_PREFIX + this.propiedad.Id;
    this.ctl2Id = CTL2_PREFIX + this.propiedad.Id;

    switch (this.propiedad.TipoDatoId ) {
      case tDouble:
        this.mask = 'separator.4';
        break;

      case tInt64:
      case tInt32:
        this.mask = 'separator.0';
        break;
    }

    this.EstableceFltroDefault();
  }

}
