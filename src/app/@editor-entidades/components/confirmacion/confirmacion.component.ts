import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { MetadataInfo } from '../../../@pika/metadata';
import { Traductor } from '../../editor-entidades.module';
import { EntidadesService } from '../../services/entidades.service';

@Component({
  selector: 'ngx-confirmacion',
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.scss']
})
export class ConfirmacionComponent implements OnInit {

  public T: Traductor;
  @Input() titulo: string;
  @Input() texto: string;
  @Input() metadata: MetadataInfo;
  @Input() entidades: EntidadesService;

  constructor(
    protected ref: NbDialogRef<ConfirmacionComponent>,
   ts: TranslateService, 
  ) { 
    this.T = new Traductor(ts);
  }

  ngOnInit(): void {
    this.CargaTraducciones();
  }

  private CargaTraducciones() {
    this.T.ts = ['ui.cancelar', 'ui.aceptar'];
    this.T.ObtenerTraducciones();
  }

  cerrar() {
    this.ref.close(false);
  }

  aceptar() {
    this.ref.close(true);
  }

}
