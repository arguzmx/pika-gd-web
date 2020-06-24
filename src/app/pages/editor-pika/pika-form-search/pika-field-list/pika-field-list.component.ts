import { TranslateService } from '@ngx-translate/core';
import { Propiedad } from './../../../../@pika/metadata/propiedad';
import { CampoBuscable, CTL_OP_PREFIX, CTL_NEG_PREFIX, CTL1_PREFIX, CTL2_PREFIX } from './../../model/campo';
import { ValorLista } from './../../../../@pika/metadata/valor-lista';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SearchFieldBase } from '../search-fields/search-field-base';
import { EditorService } from '../../services/editor-service';
import { Operacion } from '../../../../@pika/consulta';
import { AppLogService } from '../../../../@pika/servicios/app-log/app-log.service';

@Component({
  selector: 'ngx-pika-field-list',
  templateUrl: './pika-field-list.component.html',
  styleUrls: ['./pika-field-list.component.scss'],
})
export class PikaFieldListComponent extends SearchFieldBase  implements  OnInit, 
CampoBuscable {

  config: Propiedad;
  group: FormGroup;
  list: ValorLista[];
  ctl1Id: string;
  ctl2Id: string;
  negCtlId: string;
  opCtlId: string;
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

    if (this.config.OrdenarValoresListaPorNombre) {
      this.list = this.Sort('Texto');
    } else {
      this.list = this.Sort('Indice');
    }
  }

  Sort(by: string) {
    return this.config.ValoresLista.sort((obj1, obj2) => {
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
