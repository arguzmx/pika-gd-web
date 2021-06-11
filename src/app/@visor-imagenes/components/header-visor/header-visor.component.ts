import { DocumentosService } from './../../services/documentos.service';
import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Pagina, OperacionHeader } from '../../model/pagina';
import { Documento } from '../../model/documento';


@Component({
  selector: 'ngx-header-visor',
  templateUrl: './header-visor.component.html',
  styleUrls: ['./header-visor.component.scss']
})
export class HeaderVisorComponent implements OnInit, OnDestroy {
  @Output() callUpload = new  EventEmitter();
  @Output() eventMuestraInfo = new  EventEmitter();
  @Input() documento: Documento;
  
  pagina: Pagina = null;
  operaciones = OperacionHeader;
  soloImagenes: boolean = false;
  estadoMuestraInfo: boolean = false;

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioVisor: VisorImagenesService, private docService: DocumentosService) { }

  ngOnInit(): void {
    this.EscuchaPaginaActiva();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  EscuchaPaginaActiva() {
    this.servicioVisor.ObtienePaginaVisible()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((p) => {
      this.pagina = p;
    });
  }

  EstableceSoloImaganes(soloImagenes: boolean) {
    this.soloImagenes = soloImagenes;
    this.servicioVisor.EstableceFiltroPaginas(soloImagenes);
  }

  EstableceOperacionPagina(operacion: OperacionHeader) {
    this.servicioVisor.EstableceOperacionHeader(operacion);
  }

  muestraInfo() {
    this.estadoMuestraInfo = !this.estadoMuestraInfo
    this.eventMuestraInfo.emit();
  }

  doUpload() {
    this.callUpload.emit();
  }

  doZipDownload() {
    console.log( this.documento.Nombre + ".zip");
    this.docService.ObtieneZIP(this.documento.Id, this.documento.VersionId);
  }

  doPDFDownload() {
    this.docService.ObtienePDF(this.documento.Id, this.documento.VersionId);
  }

}
