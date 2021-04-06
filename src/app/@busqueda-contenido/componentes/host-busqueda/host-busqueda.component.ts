import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AppLogService } from '../../../@pika/servicios';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';

@Component({
  selector: 'ngx-host-busqueda',
  templateUrl: './host-busqueda.component.html',
  styleUrls: ['./host-busqueda.component.scss']
})
export class HostBusquedaComponent implements OnInit, OnDestroy {
  private onDestroy$: Subject<void> = new Subject<void>();

  MostrarRegresar: boolean = true; 
  VistaTrasera: boolean = false;
  MotrarMetadatos: boolean = false;

  public T: Traductor;
  
  constructor(
    ts: TranslateService,
    private applog: AppLogService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router) { 
      this.T  = new Traductor(ts);
    }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.ParamListener();
  }

  public ParamListener(): void {

    this.route.queryParams
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((params) => {
          console.log(params);
          this.CargaTraducciones();
      }, (e) => {
        this.router.navigateByUrl('/pages/sinacceso');
      }, () => { });

  }

  private CargaTraducciones() {
    this.T.ts = [
      'ui.regresar',
      'busqueda.bmetadatos',
      'busqueda.bpropiedades',
      'busqueda.bfolder',
      'busqueda.btexto',
    ];
    this.T.ObtenerTraducciones();
  }

  reset(): void {
    this.MostrarRegresar = true;
    this.VistaTrasera = false;
    this.MotrarMetadatos = false;
  } 

  public regresar() {
    this.location.back();
  }


  alternarMetadatos(): void {
    this.MotrarMetadatos = !this.MotrarMetadatos;
  }

}
