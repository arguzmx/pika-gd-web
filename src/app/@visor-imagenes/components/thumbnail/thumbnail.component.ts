import { Component, OnInit, Input, ViewChild, Inject, OnDestroy, HostListener } from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Pagina } from '../../model/pagina';
import { takeUntil, first, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ThrowStmt } from '@angular/compiler';

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
  seleccionadas: Pagina[] = [];
  paginaVisible: boolean = false;
  paginaSeleccionada: boolean = false;
  seleccionShift: boolean = false;
  seleccionCtrl: boolean = false;

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioVisor: VisorImagenesService) {}

  ngOnInit(): void {
    this.escuhaPaginaActiva();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  // Este funcion se llama al dar click en el thumbnail
  SeleccionaThumbnails() {
    if (!this.seleccionShift && !this.seleccionCtrl) {
      this.EstablecePaginaVisible();
    } else {
      this.NuevaSeleccion();
    }
  }

  EstablecePaginaVisible() {
    this.servicioVisor.EstablecerPaginaActiva(this.pagina);
  }


  escuhaPaginaActiva() {
    this.servicioVisor.ObtienePaginaVisible().subscribe( p =>  {
      this.paginaVisible = (p && this.pagina.Id === p.Id);
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


  NuevaSeleccion() {
    if (this.seleccionCtrl) {
      this.SeleccionaPaginasCtrl();
    }
    if (this.seleccionShift) {
      this.SeleccionaPaginasShift();
    }
  }
private SeleccionaPaginasCtrl(){}
private SeleccionaPaginasShift(){}

}
