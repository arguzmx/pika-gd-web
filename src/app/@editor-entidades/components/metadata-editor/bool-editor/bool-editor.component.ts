import { EditorCampo } from './../editor-campo';
import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { EventosInterprocesoService } from '../../../services/eventos-interproceso.service';

@Component({
  selector: 'ngx-bool-editor',
  templateUrl: './bool-editor.component.html',
  styleUrls: ['./bool-editor.component.scss']
})
export class BoolEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {

  @HostBinding('class.col-lg-4')
  @HostBinding('class.col-md-6')
  @HostBinding('class.col-sm-12') elementoVisible: boolean;

  habilitarClases(oculto: boolean) {
    this.elementoVisible = !oculto;
  }

  constructor(eventos: EventosInterprocesoService) {
    super(eventos);
   }

  ngOnDestroy(): void {
    this.destroy();
  }

  cambiovalor(valor){
    if (this.propiedad.EmitirCambiosValor) {
      this.EmiteEventoCambio(this.propiedad.Id, valor, this.transaccionId );
    }
  }

  ngOnInit(): void {
    this.elementoVisible = true;
    this.hookEscuchaEventos();
  }

}
