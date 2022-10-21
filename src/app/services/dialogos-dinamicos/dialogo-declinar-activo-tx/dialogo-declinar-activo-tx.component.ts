import { Component, Input, OnInit, Optional, SimpleChanges } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { EntidadesService } from '../../../@editor-entidades/services/entidades.service';
import { MetadataInfo } from '../../../@pika/metadata';
import { RespuestaDialogo } from '../respuesta-dialog';

@Component({
  selector: 'ngx-dialogo-declinar-activo-tx',
  templateUrl: './dialogo-declinar-activo-tx.component.html',
  styleUrls: ['./dialogo-declinar-activo-tx.component.scss']
})
export class DialogoDeclinarActivoTxComponent implements OnInit {

  public T: Traductor;
  @Input() titulo: string;
  @Input() texto: string;
  @Input() metadata: MetadataInfo;
  @Input() entidades: EntidadesService;
  
  private r: RespuestaDialogo = { Ok: false, Payload: null };
  public msgDeclinar: string = '';
  public confirmacionActivo: boolean = true;

  constructor(
    @Optional() protected ref: NbDialogRef<DialogoDeclinarActivoTxComponent>,
   ts: TranslateService, 
  ) { 
    this.T = new Traductor(ts);
  }

  ngOnInit(): void {
    this.CargaTraducciones();
  }

  private CargaTraducciones() {
    this.T.ts = ['ui.cancelar', 'ui.aceptar', 'vistas.declinar-activos-tx-motivo'];
    this.T.ObtenerTraducciones();
  }

  cerrar() {
    this.ref.close(this.r);
  }

  aceptar() {
    this.r.Payload = { motivo: this.msgDeclinar}
    this.r.Ok = true;
    this.ref.close(this.r);
  }

}
