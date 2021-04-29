import { BMetadatosComponent } from './../b-metadatos/b-metadatos.component';
import { BPropiedadesComponent } from './../b-propiedades/b-propiedades.component';
import { CacheFiltrosBusqueda } from './../../../@editor-entidades/services/cache-filtros-busqueda';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil, first } from 'rxjs/operators';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AppLogService } from '../../../@pika/servicios';
import { ServicioListaMetadatos, Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { ServicioBusquedaAPI } from '../../services/servicio-busqueda-api';
import { Busqueda, BusquedaContenido, EstadoBusqueda } from '../../model/busqueda-contenido';

@Component({
  selector: 'ngx-host-busqueda',
  templateUrl: './host-busqueda.component.html',
  styleUrls: ['./host-busqueda.component.scss'],
  providers: [CacheFiltrosBusqueda, ServicioBusquedaAPI, ServicioListaMetadatos]
})
export class HostBusquedaComponent implements OnInit, OnDestroy {
  private onDestroy$: Subject<void> = new Subject<void>();

  @ViewChild("propiedades") propiedades: BPropiedadesComponent;
  @ViewChild("metadatos") metadatos: BMetadatosComponent;

  MostrarRegresar: boolean = true;
  VistaTrasera: boolean = false;
  MotrarMetadatos: boolean = false;
  MostrarPropiedades: boolean = false;

  public T: Traductor;

  constructor(
    ts: TranslateService,
    private api: ServicioBusquedaAPI,
    private applog: AppLogService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router) {
    this.T = new Traductor(ts);
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
      'busqueda.buscar'
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


  public alternarPropiedades() {
    this.MostrarPropiedades = !this.MostrarPropiedades;

    if (this.MostrarPropiedades) {

    } else {

    }

  }


  public buscar(): void {

    var esValida:  boolean = false;

    const b: BusquedaContenido = {
      Id: '',
      Elementos: [],
      Fecha: new Date(),
      FechaFinalizado: new Date(),
      Estado: EstadoBusqueda.Nueva
    };

    if (this.MostrarPropiedades) {
      if (this.propiedades.Filtros().length > 0) {
        const propiedes: Busqueda = {
          Tag: 'propiedades',
          Topico: 'propiedades',
          Consulta: {
            Filtros: this.propiedades.Filtros()
          }
        }
        b.Elementos.push(propiedes);
        esValida = true;
      }
    }

    if (this.MotrarMetadatos) {

      if (this.metadatos.Filtros().length > 0) {
        const metadatos: Busqueda = {
          Tag: 'metadatos',
          Topico: 'metadatos',
          Consulta: {
            Filtros: this.metadatos.Filtros()
          }
        }
        b.Elementos.push(metadatos);
        esValida = true;
      }

    }
 
    console.log(b);
    if (esValida) {
        this.api.Buscar(b).pipe(first())
        .subscribe( r => {
            console.log(r);
        }, (err) => { console.error(err)});
    }

    

  }

}
