import { EditorCampo } from './../editor-campo';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { tDouble, tInt64, tInt32 } from '../../../../@pika/pika-module';
import { EventosInterprocesoService } from '../../../services/eventos-interproceso.service';

@Component({
  selector: 'ngx-numeric-editor',
  templateUrl: './numeric-editor.component.html',
  styleUrls: ['./numeric-editor.component.scss'],
})
export class NumericEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {

  mask: string = 'separator.4';
  negativos: boolean = true;

  constructor(eventos: EventosInterprocesoService) {
    super(eventos);
   }

ngOnDestroy(): void {
    this.destroy();
}

cambiovalor(evento) {
  if (this.propiedad.EmitirCambiosValor) {
    this.EmiteEventoCambio(this.propiedad.Id,evento.srcElement.value, this.transaccionId );
  }
}

ngOnInit(): void {
  this.hookEscuchaEventos();
    switch (this.propiedad.TipoDatoId) {
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
