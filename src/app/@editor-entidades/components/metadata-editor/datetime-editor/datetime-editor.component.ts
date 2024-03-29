import { EditorCampo } from './../editor-campo';
import { Component, OnInit, OnDestroy, ViewChild, HostBinding } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';
import {
  HTML_DATE,
  HTML_TIME,
  HTML_DATETIME,
} from '../../../../@pika/pika-module';
import { EventosInterprocesoService } from '../../../services/eventos-interproceso.service';
import { AppLogService } from '../../../../services/app-log/app-log.service';

@Component({
  selector: 'ngx-datetime-editor',
  templateUrl: './datetime-editor.component.html',
  styleUrls: ['./datetime-editor.component.scss'],
})
export class DatetimeEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {

  @HostBinding('class.col-lg-4')
  @HostBinding('class.col-md-6')
  @HostBinding('class.col-sm-12') elementoVisible: boolean;

  habilitarClases(oculto: boolean) {
    this.elementoVisible = !oculto;
  }

  @ViewChild('dt1') date1: any;

  format: string = '';
  constructor(eventos: EventosInterprocesoService, applog: AppLogService) {
    super(eventos, applog);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  cambiovalor(){
    if (this.date1._selected) {
      if (this.propiedad.EmitirCambiosValor) {
        this.EmiteEventoCambio(this.propiedad.Id, this.date1._selected, this.transaccionId);
      }
    }
  }

  ngOnInit(): void {
    this.elementoVisible = true;
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
