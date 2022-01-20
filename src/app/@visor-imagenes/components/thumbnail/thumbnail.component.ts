import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  HostListener,
  OnChanges,
  SimpleChanges,
  HostBinding,
} from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Pagina } from '../../model/pagina';
import { takeUntil, first, take, switchMap, map } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { MODO_VISTA_MINIATURAS } from '../../model/constantes';

export enum KEY_CODE {
  SHIFT = 16,
  CTRL = 17,
  A_RIGTH = 39,
  A_LEFT = 37,
}
@Component({
  selector: 'ngx-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
})
export class ThumbnailComponent implements OnInit, OnDestroy, OnChanges {
  @Input() private srcThumb: string = '';
  @Input() pagina: Pagina;
  @Input() modoVista: string = MODO_VISTA_MINIATURAS;
  modoMiniatura: boolean = true;
  paginaVisible: boolean = false;
  paginaSeleccionada: boolean = false;
  seleccionShift: boolean = false;
  seleccionCtrl: boolean = false;
  imageData: string = '';

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioVisor: VisorImagenesService,
    private httpClient: HttpClient,
    private domSanitizer: DomSanitizer) { }

 
    @HostBinding('class.col-lg-12')
    @HostBinding('class.col-md-12')
    @HostBinding('class.col-sm-12') esRenglon: boolean;
    
  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'modoVista':
            this.estableceModoVista();
            break;

          case "srcThumb":
            this.srcThumb$.next(this.srcThumb)
            break;
        }
      }
    }
  }


  estableceModoVista() {
    this.modoMiniatura  = this.modoVista === MODO_VISTA_MINIATURAS;
    this.esRenglon = !this.modoMiniatura;
  }

  ngOnInit(): void {
    this.esRenglon = false;
    this.EscuchaPaginaActiva();
    this.EscuchaPaginaSeleccion();
    this.EscuchaFiltroPaginas();
  }

  // Obtiene pagina activa para mostrar
  EscuchaPaginaActiva() {
    this.servicioVisor.ObtienePaginaVisible()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((p) => {
        this.paginaVisible = p && this.pagina.Id === p.Id;
      });
  }


  EscuchaPaginaSeleccion() {
    this.servicioVisor
      .ObtienePaginasSeleccionadas()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((pags) => {
        this.paginaSeleccionada = pags.includes(this.pagina);
      });
  }

  EscuchaFiltroPaginas() {
    this.servicioVisor
      .ObtieneFiltroPaginas()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(soloImagenes => {
        if (soloImagenes && !this.pagina.EsImagen) {
          this.servicioVisor.EliminarPaginaSeleccion(this.pagina);
          if (this.paginaVisible) this.servicioVisor.EstablecerPaginaActiva(null);
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  private srcThumb$ = new BehaviorSubject(this.srcThumb);


  dataUrl$ = this.srcThumb$.pipe(switchMap((url) => this.cargaImgSegura(url)));

  private cargaImgSegura(url: string): Observable<any> {
    return (
      this.httpClient
        .get(url, { responseType: 'blob' })
        .pipe(map((e) => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))))
    );
  }

  // Este funcion se llama al dar click en el thumbnail
  SeleccionaThumbnails() {
    if (!this.seleccionShift && !this.seleccionCtrl)
      this.EstablecePaginaActiva();
    else
      this.EstabeleceSeleccion();
  }

  EstablecePaginaActiva() {
    this.servicioVisor.EliminarSeleccion();
    this.servicioVisor.EstablecerPaginaActiva(this.pagina);
    this.servicioVisor.AdicionarPaginaSeleccion(this.pagina);
  }


  EstabeleceSeleccion() {
    if (this.seleccionCtrl) this.servicioVisor.AdicionarPaginaSeleccion(this.pagina);
    if (this.seleccionShift) this.servicioVisor.SeleccionShift(this.pagina);
  }


  @HostListener('window:keydown', ['$event'])
  ActivaSeleccionMultiple(event: KeyboardEvent) {
    this.seleccionShift = event.shiftKey;
    this.seleccionCtrl = event.ctrlKey;
  }

  @HostListener('window:keyup', ['$event'])
  DesactivaSeleccionMultiple(event: KeyboardEvent) {
    if (event.keyCode === KEY_CODE.SHIFT) this.seleccionShift = false;
    if (event.keyCode === KEY_CODE.CTRL) this.seleccionCtrl = false;

    if (this.paginaVisible)
      switch (event.key) {
        case 'ArrowRight':
          this.servicioVisor.SiguientePaginaVisible(this.pagina, true);
          break;
        case 'ArrowLeft':
          this.servicioVisor.AnteriorPaginaVisible(this.pagina, true);
          break;
      }

  }
}

