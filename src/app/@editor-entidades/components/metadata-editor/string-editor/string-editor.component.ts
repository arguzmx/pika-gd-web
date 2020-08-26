import { EntidadesService } from './../../../services/entidades.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { EditorCampo } from '../editor-campo';

@Component({
  selector: 'ngx-string-editor',
  templateUrl: './string-editor.component.html',
  styleUrls: ['./string-editor.component.scss']
})
export class StringEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {

  isTextArea: boolean = false;

  constructor(entidades: EntidadesService) {
    super(entidades);
  }

  cambiovalor(evento){
    if (this.propiedad.EmitirCambiosValor) {
      this.EmiteEventoCambio(this.propiedad.Id,evento.srcElement.value, this.congiguracion.TransactionId );
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
