import { HighlightHit } from './../../../@busqueda-contenido/model/highlight-hit';

import { Documento } from './../../model/documento';
import { DocumentosService } from './../../services/documentos.service';
import { VisorImagenesService } from './../../services/visor-imagenes.service';
import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, Input, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { first, take, takeUntil } from 'rxjs/operators';
import { Pagina } from '../../model/pagina';
import { UploadService } from '../../services/uploader.service';
import { CacheEntidadesService } from '../../../@editor-entidades/editor-entidades.module';
import { UploaderComponent } from '../uploader/uploader.component';
import { IUploadConfig } from '../../model/i-upload-config';
import { PayloadItem } from '../../../@pika/eventos/evento-aplicacion';
import { HostThumbnailsComponent } from '../host-thumbnails/host-thumbnails.component';


@Component({
  selector: 'ngx-host-visor',
  templateUrl: './host-visor.component.html',
  styleUrls: ['./host-visor.component.scss'],
  providers: [
    DocumentosService, 
    CacheEntidadesService, 
    VisorImagenesService, 
    UploadService, 
    DocumentosService],
})
export class HostVisorComponent implements OnInit, OnDestroy,
AfterViewInit, OnChanges {

  private onDestroy$: Subject<void> = new Subject<void>();
  public documento: Documento;
  private paginas: Pagina[] = [];
  public Titulo: string = '';
  public alturaComponente = '500px';
  public VistaTrasera: boolean;
  public EsImagen: boolean = true;
  public MostrarResultadosTexto: boolean = false;
  public highlightHit: HighlightHit;
  public Miniaturas: boolean = false;

  @ViewChild('thumbnails', { static: true }) thumbnails: HostThumbnailsComponent;
  
  @Output() cerrarDocumento = new  EventEmitter();
  @Output() cerrarVista = new  EventEmitter();
  @Input() config: IUploadConfig;
  @ViewChild("uploader") uploader: UploaderComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setAlturaPanel(event.target.innerHeight);
  }

  constructor(
    private servicioVisor: VisorImagenesService, 
    private uploadService: UploadService) {}

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'config':
            this.procesaConfiguracion();
            break;
        }
      }
    }
  }

  private procesaConfiguracion() {
    this.Titulo = this.config.Nombre;
    this.servicioVisor.config = this.config;
    this.uploadService.SetConfig(this.config);
    this.configuraBusquedaTexto();
  }


  private configuraBusquedaTexto() {
      if(this.config.parametros.find(x=>x.id == 'texto').valor == '1'){
        this.servicioVisor.ObtieneSinopsis(this.config.parametros.find(x=>x.id == 'searchid').valor, this.config.ElementoId)
        .pipe(first()).subscribe(s=> {
            if(s){
              this.MostrarResultadosTexto = true;
              this.highlightHit = s[0];
              this.Miniaturas = false;
            }
        });
      }
  }

  ngOnInit(): void {
    this.VistaTrasera = false;
    this.setAlturaPanel(window.innerHeight);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  ngAfterViewInit(): void {
    this.CargaDocumento();
    this.EscuchaCambiosPagina();
    this.EscuchaFiltroPaginas();
    this.EscuchaCambiarPaginaVisible();
    this.EscuchaActualizarPaginas();
  }

  public CargaDocumento () {
    this.servicioVisor.ObtieneDocumento(this.config.ElementoId)
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( doc =>  {
        this.documento = doc;
        this.paginas = this.documento.Paginas;
    });
  }

  EscuchaFiltroPaginas() {
    this.servicioVisor.ObtieneFiltroPaginas()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(soloImagenes => {
      if (this.documento) this.documento.Paginas = soloImagenes ? this.paginas.filter(x => x.EsImagen) : this.paginas;
    });
  }

  private EscuchaCambiosPagina() {
    this.servicioVisor
      .ObtienePaginaVisible()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((p) => {
        if (p) {
          this.EsImagen = p.EsImagen          
        }
      });
  }

  EscuchaCambiarPaginaVisible () {
    this.servicioVisor.ObtieneCambiarPagina()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(control => {
      if (this.documento && control) {
        let pagina: Pagina = null;
        const index = this.documento.Paginas.findIndex(x => x.Indice === control.indice);

        if (control.siguiente) {
          pagina = this.documento.Paginas[index + 1];
          if (pagina) this.servicioVisor.SiguientePaginaVisible(pagina, false);
        }
        if (control.anterior) {
          pagina = this.documento.Paginas[index - 1];
          if (pagina) this.servicioVisor.AnteriorPaginaVisible(pagina, false);
        }

        if (pagina) {
          this.servicioVisor.EliminarSeleccion();
          this.servicioVisor.EstablecerPaginaActiva(pagina);
          this.servicioVisor.AdicionarPaginaSeleccion(pagina);
        }
      }
    });
  }

  EscuchaActualizarPaginas() {
    this.servicioVisor.ObtieneActualizarPags()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(paginasNuevas => {
      if (this.documento) {
        if(this.documento.Id == paginasNuevas[0].ElementoId) {
          this.documento.Paginas = this.documento.Paginas.concat(paginasNuevas);
          this.documento.Paginas = this.servicioVisor.GeneraUrlPaginas();
        }
       }
    });

  }


 private setAlturaPanel(altura: number) {
    let h = parseInt(altura.toString(), 0) - 250;
    h = h < 0 ? 200 : h;
    const a = `${h}px`;
    this.alturaComponente = a;
  }

  public NuevaSeleccion(event) {
    this.thumbnails.SetPage(event['ParteId']);
  }
  
  // Envia el  input para mostrar el tarahet trasera del panel del visor
  public eventMuestraInfo() {
    this.VistaTrasera = !this.VistaTrasera;
  }

  public callUpload() {
    this.servicioVisor.EstableceAbrirUpload(true);
  }

  evCerrarDocumento($event: Documento) {
    this.cerrarDocumento.emit($event);
  }

  evCerrarVista() {
    this.cerrarVista.emit();
  }

  @HostListener('window:keydown', ['$event'])
  CancelaFuncionReAvPag($event) {
    if ($event.key === 'PageUp' || $event.key === 'PageDown') {
      $event.preventDefault();
    }
  }

  @HostListener('window:keyup', ['$event'])
  CambiaPaginaVisible($event) {
    $event.stopPropagation();
    if ($event.key === 'PageUp' || $event.key === 'PageDown') {
      let paginaActual = null;
      this.servicioVisor.ObtienePaginaVisible()
      .pipe(take(1))
      .subscribe(pagina => { if (pagina) paginaActual = pagina; });

      switch ($event.key) {
        case 'PageDown':
          this.servicioVisor.SiguientePaginaVisible(paginaActual, true);
        break;
        case 'PageUp':
          this.servicioVisor.AnteriorPaginaVisible(paginaActual, true);
        break;
      }
    }
  }
}
