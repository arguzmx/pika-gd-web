import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MODO_VISTA_MINIATURAS } from '../../model/constantes';
import { Documento } from '../../model/documento';
import { VisorImagenesService } from '../../services/visor-imagenes.service';

@Component({
  selector: 'ngx-host-thumbnails',
  templateUrl: './host-thumbnails.component.html',
  styleUrls: ['./host-thumbnails.component.scss'],
})
export class HostThumbnailsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() documento: Documento;
  @Input() alturaComponente;
  @Input() modoVista;
  itemSize = 50;
  public cargandoPaginas: boolean = false;
  private onDestroy$: Subject<void> = new Subject<void>();
  public alturaVisor = "400px"

  // @ViewChild("scroller", { static: true })
  public virtualScrollViewport: CdkVirtualScrollViewport;

  constructor(private visorService: VisorImagenesService) {
    this.ListenerPaginas();
    this.setAlturaVisor();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setAlturaVisor();
  }

private setAlturaVisor() {
  if ( this.modoVista == MODO_VISTA_MINIATURAS) {
    this.itemSize =50;
  } else {
    this.itemSize =30;
  }
  if (this.alturaComponente) {
    this.alturaVisor = `${this.alturaComponente}px`;
  }
}

  public SetPage(id: string ){
    const pagina =this.documento.Paginas.find(x=>x.Id == id);
    if(pagina) {
      this.visorService.EliminarSeleccion();
      this.visorService.EstablecerPaginaActiva(pagina);
      this.visorService.AdicionarPaginaSeleccion(pagina);
    }
  }

  private ListenerPaginas() {
    this.visorService.LeyendoPaginas()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((evento) => {
        this.cargandoPaginas = evento;
        // this.virtualScrollViewport.scrollTo({
        //   bottom: 0,
        //   behavior: "auto"
        // })
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }
  

  ngOnInit(): void {
    this.documento = { Nombre: '', Paginas: [], Id: '', VersionId: '' };
  }
}
