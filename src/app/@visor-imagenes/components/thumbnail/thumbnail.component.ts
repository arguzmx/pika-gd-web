import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Pagina } from '../../model/pagina';
import { takeUntil, first, take, switchMap, map } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

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
export class ThumbnailComponent implements OnInit, OnDestroy {
  @Input() private srcThumb: string = '';
  @Input() pagina: Pagina;

  paginaVisible: boolean = false;
  paginaSeleccionada: boolean = false;
  seleccionShift: boolean = false;
  seleccionCtrl: boolean = false;

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioVisor: VisorImagenesService,
              private httpClient: HttpClient,
              private domSanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.EscuchaPaginaActiva();
    this.EscuchaPaginaSeleccion();
    this.EscuchaFiltroPaginas();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  private srcThumb$ = new BehaviorSubject(this.srcThumb);
  ngOnChanges(): void {
      this.srcThumb$.next(this.srcThumb);
  }

  dataUrl$ = this.srcThumb$.pipe(switchMap((url) => this.cargaImgSegura(url)));

  private cargaImgSegura(url: string): Observable<any> {
    return (
        this.httpClient
    // load the image as a blob
        .get(url, { responseType: 'blob' })
    // create an object url of that blob that we can use in the src attribute
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

  EscuchaPaginaActiva() {
    this.servicioVisor.ObtienePaginaVisible()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((p) => {
      this.paginaVisible = p && this.pagina.Id === p.Id;
    });
  }

  EstabeleceSeleccion() {
    if (this.seleccionCtrl) this.servicioVisor.AdicionarPaginaSeleccion(this.pagina);
    if (this.seleccionShift) this.servicioVisor.SeleccionShift(this.pagina);
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
        console.log('r');
        this.servicioVisor.SiguientePaginaVisible(this.pagina, true);
      break;
      case 'ArrowLeft':
        console.log('L');
        this.servicioVisor.AnteriorPaginaVisible(this.pagina, true);
      break;
    }

  }
}

