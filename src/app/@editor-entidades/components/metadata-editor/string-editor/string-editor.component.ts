import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { EditorCampo } from '../editor-campo';
import { EventosInterprocesoService } from '../../../services/eventos-interproceso.service';

@Component({
  selector: 'ngx-string-editor',
  templateUrl: './string-editor.component.html',
  styleUrls: ['./string-editor.component.scss']
})
export class StringEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {

  isTextArea: boolean = false;

  constructor(eventos: EventosInterprocesoService ) {
    super(eventos);
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
    this.hookEscuchaEventos();
    this.isTextArea = (this.propiedad.ControlHTML === 'textarea');
  }

}
