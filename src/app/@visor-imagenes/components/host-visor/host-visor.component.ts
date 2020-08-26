import { Documento } from './../../model/documento';
import { DocumentosService } from './../../services/documentos.service';
import { VisorImagenesService } from './../../services/visor-imagenes.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NbLayoutRulerService, NbMediaBreakpointsService, NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-host-visor',
  templateUrl: './host-visor.component.html',
  styleUrls: ['./host-visor.component.scss'],
  providers: [VisorImagenesService, DocumentosService],
})
export class HostVisorComponent implements OnInit, OnDestroy, AfterViewInit {
  private onDestroy$: Subject<void> = new Subject<void>();
  public documento: Documento;
  public Titulo: string = '';

  constructor(private servicioVisor: VisorImagenesService,
    private themeService: NbThemeService) { }


  ngAfterViewInit(): void {
    this.servicioVisor.ObtieneDocumento('EjmeploId')
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( doc =>  {
        this.documento = doc;
        this.Titulo = doc.Nombre;
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }


  // Ejemplo de como se obtienen los cambios en las p�ginas seleccinadas
  private ObtieneCambiosPaginasSeleccioandas() {
    this.servicioVisor.ObtienePaginasSeleccionadas()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( paginas => {
        console.log(paginas);
    });
  }

}
