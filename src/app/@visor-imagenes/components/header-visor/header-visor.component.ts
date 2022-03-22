import { DocumentosService } from './../../services/documentos.service';
import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Pagina, OperacionHeader } from '../../model/pagina';
import { Documento } from '../../model/documento';
import { NumeroABytes } from '../../model/comunes';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'ngx-header-visor',
  templateUrl: './header-visor.component.html',
  styleUrls: ['./header-visor.component.scss']
})
export class HeaderVisorComponent implements OnInit, OnDestroy, OnChanges {
  @Output() callUpload = new  EventEmitter();
  @Output() eventMuestraInfo = new  EventEmitter();
  @Input() documento: Documento;
  public T: Traductor;

  pagina: Pagina = null;
  operaciones = OperacionHeader;
  soloImagenes: boolean = false;
  estadoMuestraInfo: boolean = false;

  paginas: string = '';
  tamano: string = '';
  seleccionadas: string = '0';

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioVisor: VisorImagenesService, ts: TranslateService, private docService: DocumentosService) { 
    this.T = new Traductor(ts);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.procesaCambios();
  }

  private CargaTraducciones() {
    this.T.ts = [
      'componentes.visor-documento.lbl-paginas',
      'componentes.visor-documento.lbl-swap-vert',
      'componentes.visor-documento.lbl-swap-horiz',
      'componentes.visor-documento.lbl-rot-180',
      'componentes.visor-documento.lbl-rot-der',
      'componentes.visor-documento.lbl-rot-izq',
    ];
    this.T.ObtenerTraducciones();
  }

  private procesaCambios() {
    if(this.documento){
      let s = 0;
      this.paginas = `${this.documento.Paginas.length}`;
      this.documento.Paginas.forEach(p=> {
        s += p.TamanoBytes;
      });
      this.tamano = NumeroABytes(s);
    }
  }

  ngOnInit(): void {
    this.EscuchaPaginaActiva();
    this.CargaTraducciones();
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

    this.servicioVisor.ObtienePaginasSeleccionadas()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((p) => {
      this.seleccionadas = `${p.length}`;
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
    this.docService.ObtieneZIP(this.documento.Id, this.documento.VersionId);
  }

  doPDFDownload() {
    // this.docService.ObtienePDF(this.documento.Id, this.documento.VersionId);
  }

}
