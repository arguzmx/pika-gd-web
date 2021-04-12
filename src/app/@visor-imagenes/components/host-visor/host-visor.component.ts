
import { Documento } from './../../model/documento';
import { DocumentosService } from './../../services/documentos.service';
import { VisorImagenesService } from './../../services/visor-imagenes.service';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren,
  QueryList, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { IUploadConfig } from '../../../@uploader/uploader.module';
import { FileDropComponent } from '../../../@uploader/file-drop/file-drop.component';
import { Pagina } from '../../model/pagina';
import { UploadService } from '../../services/uploader.service';
import { CacheEntidadesService } from '../../../@editor-entidades/editor-entidades.module';

@Component({
  selector: 'ngx-host-visor',
  templateUrl: './host-visor.component.html',
  styleUrls: ['./host-visor.component.scss'],
  providers: [DocumentosService, CacheEntidadesService],
})
export class HostVisorComponent implements OnInit, OnDestroy,
AfterViewInit, OnChanges {
  public documento: Documento;
  private paginas: Pagina[] = [];
  public Titulo: string = '';
  public alturaComponente = '500px';
  public VistaTrasera: boolean;

  @Input() config: IUploadConfig;
  @ViewChildren(FileDropComponent) uploaders: QueryList<FileDropComponent>;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setAlturaPanel(event.target.innerHeight);
  }

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioVisor: VisorImagenesService, private uploadService: UploadService) { }

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
        this.documento.Paginas = this.documento.Paginas.concat(paginasNuevas);
        this.documento.Paginas = this.servicioVisor.GeneraUrlPaginas();
      }
    });

  }


 private setAlturaPanel(altura: number) {
    let h = parseInt(altura.toString(), 0) - 250;
    h = h < 0 ? 200 : h;
    const a = `${h}px`;
    this.alturaComponente = a;
  }

  // Ejemplo de como se obtienen los cambios en las p�ginas seleccinadas
  private ObtieneCambiosPaginasSeleccioandas() {
    this.servicioVisor.ObtienePaginasSeleccionadas()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( paginas => {
        // console.log(paginas);
    });
  }


  // Envia el  input para mostrar el tarahet trasera del panel del visor
  public eventMuestraInfo() {
    this.VistaTrasera = !this.VistaTrasera;
  }

  public callUpload() {
    this.servicioVisor.EstableceAbrirUpload(true);
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
