import { EntidadesService } from './../../../services/entidades.service';
import { EditorCampo } from './../editor-campo';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';
import {
  HTML_DATE,
  HTML_TIME,
  HTML_DATETIME,
} from '../../../../@pika/pika-module';

@Component({
  selector: 'ngx-datetime-editor',
  templateUrl: './datetime-editor.component.html',
  styleUrls: ['./datetime-editor.component.scss'],
})
export class DatetimeEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {

  @ViewChild('dt1') date1: any;

  format: string = '';
  constructor(e: EntidadesService) {
    super(e);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  cambiovalor(){
    if (this.date1._selected) {
      if (this.propiedad.EmitirCambiosValor) {
        this.EmiteEventoCambio(this.propiedad.Id, this.date1._selected, this.congiguracion.TransactionId );
      }
    }
  }

  ngOnInit(): void {
    this.hookEscuchaEventos();
    const webcontrol = this.propiedad.AtributosVistaUI.find(
      (x) => x.Plataforma === 'web',
    );
    if (webcontrol) {
      switch (webcontrol.Control) {
        case HTML_DATE:
          this.format = 'calendar';
          break;
        case HTML_TIME:
          this.format = 'timer';
          break;
        case HTML_DATETIME:
          this.format = 'both';
          break;
      }
    }
  }
}
