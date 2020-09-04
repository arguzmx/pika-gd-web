import { Component, OnInit, OnDestroy } from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Pagina, OperacionHeader } from '../../model/pagina';


@Component({
  selector: 'ngx-header-visor',
  templateUrl: './header-visor.component.html',
  styleUrls: ['./header-visor.component.scss']
})
export class HeaderVisorComponent implements OnInit, OnDestroy {

  pagina: Pagina = null;
  operaciones = OperacionHeader;
  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioVisor: VisorImagenesService) { }

  ngOnInit(): void {
    this.EscuchaPaginaActiva();
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
  }

  EstableceOperacionPagina(operacion: OperacionHeader) {
    this.servicioVisor.EstableceOperacionHeader(operacion);
  }

}
