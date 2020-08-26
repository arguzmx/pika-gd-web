import { EntidadesService } from './../../../services/entidades.service';
import { EditorCampo } from './../editor-campo';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { Propiedad } from '../../../../@pika/pika-module';
import { ConfiguracionEntidad } from '../../../model/configuracion-entidad';

@Component({
  selector: 'ngx-bool-editor',
  templateUrl: './bool-editor.component.html',
  styleUrls: ['./bool-editor.component.scss']
})
export class BoolEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {

  constructor(e: EntidadesService) {
    super(e);
   }

  ngOnDestroy(): void {
    this.destroy();
  }

  cambiovalor(valor){
    if (this.propiedad.EmitirCambiosValor) {
      this.EmiteEventoCambio(this.propiedad.Id, valor, this.congiguracion.TransactionId );
    }
  }

  ngOnInit(): void {
    this.hookEscuchaEventos();
  }

}
