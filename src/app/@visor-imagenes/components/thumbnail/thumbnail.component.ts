import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Pagina } from '../../model/pagina';
import { takeUntil, first, take } from 'rxjs/operators';
import { Subject } from 'rxjs';

export enum KEY_CODE {
  SHIFT = 16,
  CTRL = 17,
}
@Component({
  selector: 'ngx-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
})
export class ThumbnailComponent implements OnInit, OnDestroy {
  @Input() pagina: Pagina;
  paginaVisible: boolean = false;
  paginaSeleccionada: boolean = false;
  seleccionShift: boolean = false;
  seleccionCtrl: boolean = false;

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioVisor: VisorImagenesService) {}

  ngOnInit(): void {
    this.EscuchaPaginaActiva();
    this.EscuchaPaginaSeleccion();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
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


  @HostListener('window:keydown', ['$event'])
  ActivaSeleccionMultiple(event: KeyboardEvent) {
    this.seleccionShift = event.keyCode === KEY_CODE.SHIFT;
    this.seleccionCtrl = event.keyCode === KEY_CODE.CTRL;
  }

  @HostListener('window:keyup', ['$event'])
  DesactivaSeleccionMultiple(event: KeyboardEvent) {
    if (event.keyCode === KEY_CODE.SHIFT) this.seleccionShift = false;
    if (event.keyCode === KEY_CODE.CTRL) this.seleccionCtrl = false;
  }
}
