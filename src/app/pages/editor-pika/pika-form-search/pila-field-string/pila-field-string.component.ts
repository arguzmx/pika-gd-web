import { TranslateService } from '@ngx-translate/core';
import { Propiedad } from './../../../../@pika/metadata/propiedad';
import { CampoBuscable, CTL_OP_PREFIX, CTL_NEG_PREFIX, CTL1_PREFIX, CTL2_PREFIX } from './../../model/campo';
import { Component, OnInit, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SearchFieldBase } from '../search-fields/search-field-base';
import { EditorService } from '../../services/editor-service';
import { Operacion } from '../../../../@pika/consulta';
import { AppLogService } from '../../../../@pika/servicios/app-log/app-log.service';

@Component({
  selector: 'ngx-pila-field-string',
  styleUrls: ['./pila-field-string.component.scss'],
  templateUrl: './pila-field-string.component.html',
})
export class PikaFieldStringComponent extends SearchFieldBase implements OnInit,
CampoBuscable {

  config: Propiedad;
  group: FormGroup;
  ctl1Id: string;
  ctl2Id: string;
  negCtlId: string;
  opCtlId: string;
  ops = [Operacion.OP_EQ, Operacion.OP_CONTAINS, Operacion.OP_ENDS,
    Operacion.OP_STARTS, Operacion.OP_FULLTEXT];

  constructor(appLog: AppLogService, ts: TranslateService, editorService: EditorService) {
    super(ts, appLog, editorService);
    this.ts = ['ui.no'];
  }

  verificaFiltro(): void {
    let valid: boolean = true;
    if (this.filtro.Operador == null) valid = false;

    if (valid) {
      if (this.filtro.Valor.length === 0) {
        valid = false;
      } else {
        if ( (this.filtro.Valor[0] === null) || (this.filtro.Valor[0] === '' )) {
          valid = false;
        }
      }
    }
    this.setValorString(null);
    this.setValidIcon(valid);
    if (valid) {
      this.setValorString(this.filtro.Valor[0]);
      this.editorService.AgregarFiltro(this.filtro);
    } else {
      this.editorService.InvalidarFiltro(this.filtro);
    }
  }

  closeFilter(): void {
    this.editorService.EliminarFiltro(this.config);
  }


  valor1(valor): void {
    this.inputChange(valor.srcElement.value);
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
  }
}
