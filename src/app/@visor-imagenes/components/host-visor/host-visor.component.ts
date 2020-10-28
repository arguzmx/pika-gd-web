
import { UploaderComponent } from './../../../@uploader/uploader.component';
import { Documento } from './../../model/documento';
import { DocumentosService } from './../../services/documentos.service';
import { VisorImagenesService } from './../../services/visor-imagenes.service';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren,
  QueryList, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IUploadConfig } from '../../../@uploader/uploader.module';
import { FileDropComponent } from '../../../@uploader/file-drop/file-drop.component';
import { Pagina } from '../../model/pagina';

@Component({
  selector: 'ngx-host-visor',
  templateUrl: './host-visor.component.html',
  styleUrls: ['./host-visor.component.scss'],
  providers: [VisorImagenesService, DocumentosService],
})
export class HostVisorComponent implements OnInit, OnDestroy,
AfterViewInit, OnChanges {
  private onDestroy$: Subject<void> = new Subject<void>();
  public documento: Documento;
  private paginas: Pagina[] = [];
  public Titulo: string = '';
  public alturaComponente = '500px';

  @Input() config: IUploadConfig;
  @ViewChildren(UploaderComponent) uploaders: QueryList<UploaderComponent>;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setAlturaPanel(event.target.innerHeight);
  }

  constructor(private servicioVisor: VisorImagenesService) { }

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

  EscuchaCambiarPaginaVisible(){
    this.servicioVisor.ObtieneCambiarPagina()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(control => {
      if (this.documento && control) {
        let pagina: Pagina = null;
        const index = this.documento.Paginas.findIndex(x => x.Indice === control.indice);
        
        console.log(index, control.anterior, control.siguiente);

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


  public callUpload() {
    console.log(this.uploaders.first);
    this.uploaders.first.openUploadSheet();
  }

}
