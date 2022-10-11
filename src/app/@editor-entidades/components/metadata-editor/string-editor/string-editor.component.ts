import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { EditorCampo } from '../editor-campo';
import { EventosInterprocesoService } from '../../../services/eventos-interproceso.service';
import { AppLogService } from '../../../../services/app-log/app-log.service';

@Component({
  selector: 'ngx-string-editor',
  templateUrl: './string-editor.component.html',
  styleUrls: ['./string-editor.component.scss']
})
export class StringEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {

  @HostBinding('class.col-lg-4')
  @HostBinding('class.col-md-6')
  @HostBinding('class.col-sm-12') elementoVisible: boolean;

  habilitarClases(oculto: boolean) {
    this.elementoVisible = !oculto;
  }

  isTextArea: boolean = false;

  constructor(eventos: EventosInterprocesoService, applog: AppLogService) {
    super(eventos, applog);
  }

  cambiovalor(evento){
    if (this.propiedad.EmitirCambiosValor) {
      this.EmiteEventoCambio(this.propiedad.Id,evento.srcElement.value, this.transaccionId );
    }
  }

  ngOnDestroy(): void {
      this.destroy();
  }

  ngOnInit(): void {
    this.elementoVisible = true;
    this.hookEscuchaEventos();
    this.isTextArea = (this.propiedad.ControlHTML === 'textarea');
  }

}
