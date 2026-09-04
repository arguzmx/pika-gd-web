import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { Pagina } from '../../model/pagina';
import { DocumentosService } from '../../services/documentos.service';

@Component({
  selector: 'ngx-visor-otro',
  templateUrl: './visor-otro.component.html',
  styleUrls: ['./visor-otro.component.scss']
})
export class VisorOtroComponent implements OnInit {
@Input() pagina: Pagina;
public T: Traductor;

  constructor(private docService: DocumentosService, ts: TranslateService) { 
    this.T = new Traductor(ts);
  }

  ngOnInit(): void {
    this.CargaTraducciones();
  }

  private CargaTraducciones() {
    this.T.ts = ['ui.confirmar', 'ui.cancelar', 'ui.aceptar'];
    this.T.ObtenerTraducciones();
  }

  doDownload() {
    this.docService.DescargaArchivo(this.pagina.Url, this.pagina.Nombre);
  }

}
