import { AppLogService } from './../../../../@pika/servicios/app-log/app-log.service';
import { TranslateService } from '@ngx-translate/core';
import { Propiedad } from './../../../../@pika/metadata/propiedad';
import { CampoBuscable, CTL_NEG_PREFIX, CTL_OP_PREFIX, CTL1_PREFIX, CTL2_PREFIX } from './../../model/campo';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SearchFieldBase } from '../search-fields/search-field-base';
import { EditorService } from '../../services/editor-service';
import { Operacion } from '../../../../@pika/consulta';

@Component({
  selector: 'ngx-pika-field-bool',
  templateUrl: './pika-field-bool.component.html',
  styleUrls: ['./pika-field-bool.component.scss']
})
export class PikaFieldBoolComponent  extends SearchFieldBase implements OnInit, 
CampoBuscable {

  config: Propiedad;
  group: FormGroup;
  negCtlId: string;
  opCtlId: string;
  ctl1Id: string;
  ctl2Id: string;
  ops = [Operacion.OP_EQ];

  constructor(appLog: AppLogService, ts: TranslateService, editorService: EditorService) {
    super(ts, appLog, editorService);
    this.ts = ['ui.no'];
  }

  verificaFiltro(): void {
    let valid: boolean = true;
    if (this.filtro.Valor.length === 0) valid = false;
    if (this.filtro.Operador == null) valid = false;

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
