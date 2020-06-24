import { TranslateService } from '@ngx-translate/core';
import { Propiedad } from './../../../../@pika/metadata/propiedad';
import { CampoBuscable, CTL_OP_PREFIX, CTL_NEG_PREFIX, CTL1_PREFIX, CTL2_PREFIX } from './../../model/campo';
import { Component, OnInit, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Operacion } from '../../../../@pika/consulta/operacion';
import { tDouble, tInt32, tInt64 } from '../../../../@pika/metadata';
import { SearchFieldBase } from '../search-fields/search-field-base';
import { EditorService } from '../../services/editor-service';
import { AppLogService } from '../../../../@pika/servicios/app-log/app-log.service';



@Component({
  selector: 'ngx-pika-field-numeric',
  templateUrl: './pika-field-numeric.component.html',
  styleUrls: ['./pika-field-numeric.component.scss'],
})
export class PikaFieldNumericComponent extends SearchFieldBase
  implements OnInit, CampoBuscable {
  isBetween: boolean = false;
  config: Propiedad;
  group: FormGroup;
  mask: string = 'separator.4';
  negativos: boolean = true;
  ctl1Id: string;
  ctl2Id: string;
  negCtlId: string;
  opCtlId: string;
  ops = [Operacion.OP_EQ, Operacion.OP_BETWEN, Operacion.OP_GT, Operacion.OP_GTE,
    Operacion.OP_LT, Operacion.OP_LTE];

  constructor(appLog: AppLogService, ts: TranslateService, editorService: EditorService) {
    super(ts, appLog, editorService);
    this.ts = ['ui.no'];
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
    if (valid) {
      if (this.filtro.Operador === Operacion.OP_BETWEN.toString()) {
        this.setValorString(this.filtro.Valor[0] + ',' + this.filtro.Valor[1]);
      } else {
        this.setValorString(this.filtro.Valor[0]);
      }
      this.editorService.AgregarFiltro(this.filtro);
    } else {
      this.editorService.InvalidarFiltro(this.filtro);
    }
  }

  closeFilter(): void {
    this.editorService.EliminarFiltro(this.config);
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

    this.ObtenerTraducciones();
    this.ObtenerOperadores(this.ops);

    this.filtro.Propiedad = this.config.Id;
    this.filtro.Id = this.config.Id;

    this.opCtlId = CTL_OP_PREFIX + this.config.Id;
    this.negCtlId = CTL_NEG_PREFIX + this.config.Id;
    this.ctl1Id = CTL1_PREFIX + this.config.Id;
    this.ctl2Id = CTL2_PREFIX + this.config.Id;

    switch (this.config.TipoDatoId ) {
      case tDouble:
        this.mask = 'separator.4';
        break;

      case tInt64:
      case tInt32:
        this.mask = 'separator.0';
        break;
    }
  }
}
