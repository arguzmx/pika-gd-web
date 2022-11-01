import { Component, Input, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
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
  @Input() confirmarId: boolean = false;
  @Input() confirmacionId: string = '';
  public confirmacionActivo: boolean = true;

  constructor(
    @Optional() protected ref: NbDialogRef<ConfirmacionComponent>,
   ts: TranslateService, 
  ) { 
    this.T = new Traductor(ts);
  }

  ngOnInit(): void {
    this.CargaTraducciones();
    if(this.confirmarId) {
      this.confirmacionActivo = false;
    }
  }

  private CargaTraducciones() {
    this.T.ts = ['ui.cancelar', 'ui.aceptar', 'editor-pika.mensajes.confirm-crud-eliminarid'];
    this.T.ObtenerTraducciones( { nombre: this.confirmacionId });
  }

  cambiaIdConfirmacion(id: string) {
    this.confirmacionActivo = (id == this.confirmacionId) 
  }

  cerrar() {
    this.ref.close(false);
  }

  aceptar() {
    this.ref.close(true);
  }

}
