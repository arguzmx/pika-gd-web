import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { MetadataInfo } from '../../../@pika/metadata';

@Component({
  selector: 'ngx-confirmacion-visor',
  templateUrl: './confirmacion-visor.component.html',
  styleUrls: ['./confirmacion-visor.component.scss']
})
export class ConfirmacionVisorComponent implements OnInit {

  public T: Traductor;
  @Input() titulo: string;
  @Input() texto: string;

  constructor(
    protected ref: NbDialogRef<ConfirmacionVisorComponent>,
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
