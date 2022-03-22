import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';

@Component({
  selector: 'ngx-pdf-download',
  templateUrl: './pdf-download.component.html',
  styleUrls: ['./pdf-download.component.scss']
})
export class PdfDownloadComponent implements OnInit {

  // selectporciento
  public T: Traductor;
  @Input() titulo: string;
  private pdfporciento: number = 100;
  constructor(
    protected ref: NbDialogRef<PdfDownloadComponent>,
   ts: TranslateService, 
  ) { 
    this.T = new Traductor(ts);
  }

  ngOnInit(): void {
    this.CargaTraducciones();
  }

  private CargaTraducciones() {
    this.T.ts = ['ui.cancelar', 'ui.aceptar', 'componentes.visor-documento.porciento-pdf'];
    this.T.ObtenerTraducciones();
  }

  cerrar() {
    this.ref.close( { confirma: false, porciento: 100 } );
  }

  aceptar() {
    this.ref.close( { confirma: true, porciento: this.pdfporciento });
  }

  porciento(p: string) {
    this.pdfporciento = parseInt(p);
  }

}
