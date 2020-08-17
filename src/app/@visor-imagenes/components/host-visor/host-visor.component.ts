import { Documento } from './../../model/documento';
import { DocumentosService } from './../../services/documentos.service';
import { VisorImagenesService } from './../../services/visor-imagenes.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  constructor(private servicioVisor: VisorImagenesService) { }
 

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

}
