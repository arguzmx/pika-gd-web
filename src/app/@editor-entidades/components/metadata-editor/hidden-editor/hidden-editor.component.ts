import { EntidadesService } from './../../../services/entidades.service';
import { EditorCampo } from './../editor-campo';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';


@Component({
  selector: 'ngx-hidden-editor',
  templateUrl: './hidden-editor.component.html',
  styleUrls: ['./hidden-editor.component.scss']
})
export class HiddenEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {

  constructor(e: EntidadesService) {
    super(e);
  }

  cambiovalor(evento){
    if (this.propiedad.EmitirCambiosValor) {
      this.EmiteEventoCambio(this.propiedad.Id, evento.srcElement.value, this.congiguracion.TransactionId );
    }
  }

  ngOnDestroy(): void {
    this.destroy();
}

  ngOnInit(): void {
    this.hookEscuchaEventos();
  }

}
