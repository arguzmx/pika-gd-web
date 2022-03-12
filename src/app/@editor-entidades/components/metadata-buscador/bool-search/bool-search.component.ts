import { CacheFiltrosBusqueda } from './../../../services/cache-filtros-busqueda';
import { BuscadorEntidadesBase } from './../../../model/buscador-entidades-base';
import { ICampoBuscable } from '../../../model/i-campo-buscable';
import { Component, OnInit } from '@angular/core';
import { Operacion } from '../../../../@pika/pika-module';
import { TranslateService } from '@ngx-translate/core';
import { CTL_OP_PREFIX, CTL_NEG_PREFIX, CTL1_PREFIX, CTL2_PREFIX } from '../../../model/constantes';
import { Router } from '@angular/router';
import { Traductor } from '../../../services/traductor';
import { AppLogService } from '../../../../services/app-log/app-log.service';

@Component({
  selector: 'ngx-bool-search',
  templateUrl: './bool-search.component.html',
  styleUrls: ['./bool-search.component.scss'],
})
export class BoolSearchComponent extends BuscadorEntidadesBase
  implements OnInit, ICampoBuscable {
  ops = [Operacion.OP_EQ];
  public T: Traductor;

  constructor(
    applog: AppLogService,
    translate: TranslateService,
    cache: CacheFiltrosBusqueda,
    router: Router,
  ) {
    super(cache, translate);
    this.T  = new Traductor(translate);
    this.T.ts = ['ui.no', 'ui.verdadero', 'ui.falso'];
  }

  verificaFiltro(): void {
    let valid: boolean = true;
    if (this.filtro.Valor.length === 0) valid = false;
    if (this.filtro.Operador == null) valid = false;

    this.setValorString(null);
    this.setValidIcon(valid);

    this.filtro.Valido = valid;
    if (valid) {
      this.setValorString(this.filtro.Valor[0]);
    }
    this.EstadoFiltro.emit(this.filtro);
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

    this.EstableceFltroDefault();
  }


}
