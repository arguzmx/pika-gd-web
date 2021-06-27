import { Component, OnInit, OnDestroy, Output, Input, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { Documento } from '../../model/documento';
import { DocumentosService } from '../../services/documentos.service';
import { VisorImagenesService } from '../../services/visor-imagenes.service';

@Component({
  selector: 'ngx-header-thumbs',
  templateUrl: './header-thumbs.component.html',
  styleUrls: ['./header-thumbs.component.scss']
})
export class HeaderThumbsComponent implements OnInit, OnDestroy {
  @Output() callUpload = new  EventEmitter();
  @Output() cerrarDocumento = new  EventEmitter();
  @Output() cerrarVista = new  EventEmitter();
  @Output() eventMuestraInfo = new  EventEmitter();
  @Input() documento: Documento;
  
  soloImagenes: boolean = false;
  estadoMuestraInfo: boolean = false;
  
  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioVisor: VisorImagenesService, private docService: DocumentosService) { }

  ngOnInit(): void {
  }

  
  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  EstableceSoloImaganes(soloImagenes: boolean) {
    this.soloImagenes = soloImagenes;
    this.servicioVisor.EstableceFiltroPaginas(soloImagenes);
  }

  muestraInfo() {
    this.estadoMuestraInfo = !this.estadoMuestraInfo
    this.eventMuestraInfo.emit();
  }


  doUpload() {
    this.callUpload.emit();
  }

  doZipDownload() {
    this.docService.ObtieneZIP(this.documento.Id, this.documento.VersionId);
  }

  doPDFDownload() {
    this.docService.ObtienePDF(this.documento.Id, this.documento.VersionId);
  }

  CerrarDocumento() {
    this.cerrarDocumento.emit(this.documento);
  }

  CerraVista()  {
    this.cerrarVista.emit();
  }

}
