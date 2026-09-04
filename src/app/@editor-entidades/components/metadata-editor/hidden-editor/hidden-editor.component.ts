import { EntidadesService } from './../../../services/entidades.service';
import { EditorCampo } from './../editor-campo';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { EventosInterprocesoService } from '../../../services/eventos-interproceso.service';
import { AppLogService } from '../../../../services/app-log/app-log.service';


@Component({
  selector: 'ngx-hidden-editor',
  templateUrl: './hidden-editor.component.html',
  styleUrls: ['./hidden-editor.component.scss']
})
export class HiddenEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {

  constructor(eventos: EventosInterprocesoService, applog: AppLogService) {
    super(eventos, applog);
  }

  cambiovalor(evento){
    if (this.propiedad.EmitirCambiosValor) {
      this.EmiteEventoCambio(this.propiedad.Id, evento.srcElement.value, this.transaccionId );
    }
  }

  ngOnDestroy(): void {
    this.destroy();
}

  ngOnInit(): void {
    this.hookEscuchaEventos();
  }

}
