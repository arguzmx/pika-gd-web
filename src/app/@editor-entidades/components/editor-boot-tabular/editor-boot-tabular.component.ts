import { PARAM_ID_ORIGEN, PARAM_TIPO_DESPLIEGUE } from './../../model/constantes';
import { EntidadesService } from './../../services/entidades.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { PARAM_TIPO, PARAM_TIPO_ORIGEN } from '../../model/constantes';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { CacheEntidadesService } from '../../services/cache-entidades.service';
import { SesionStore } from '../../../@pika/pika-module';
import { CacheFiltrosBusqueda } from '../../services/cache-filtros-busqueda';
import { ServicioListaMetadatos } from '../../services/servicio-lista-metadatos';

@Component({
  selector: 'ngx-editor-boot-tabular',
  templateUrl: './editor-boot-tabular.component.html',
  styleUrls: ['./editor-boot-tabular.component.scss'],
  providers: [EntidadesService, CacheEntidadesService, CacheFiltrosBusqueda, ServicioListaMetadatos],
})
export class EditorBootTabularComponent implements OnInit, OnDestroy {
  private onDestroy$: Subject<void> = new Subject<void>();
  config: ConfiguracionEntidad;

  constructor(
    private sesionStore: SesionStore,
    private entidades: EntidadesService,
    private route: ActivatedRoute,
    private router: Router) { }


  private paramTipo: string;
  private paramTipoOrigen: string;

  public ParamListener(): void {
    const rutas = <any[]>this.route.snapshot.data['entidadesResolver'];
    if (rutas.length > 0) {
      this.sesionStore.setRutasTipo(rutas);
      this.route.queryParams
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((params) => {

          this.paramTipo = (params[PARAM_TIPO] || '').toLowerCase();
          this.paramTipoOrigen = (params[PARAM_TIPO_ORIGEN] || '' ).toLowerCase();
          //console.log(params[PARAM_TIPO]);

          this.entidades.ObtieneMetadatos(params[PARAM_TIPO]).pipe(first())
            .subscribe(m => {
              let pcontenido = null;
              let permisos = true;

              // console.log(m);
              // console.log(m.TokenMod);
              if (m.TokenApp && m.TokenMod) {
                pcontenido = this.entidades.ObtienePermiso(m.TokenApp, m.TokenMod);
                permisos = permisos && this.entidades.PermitirAccesoACL(pcontenido);
              }


              // console.log(pcontenido);
              // console.log(permisos);
              if (permisos) {
                this.config = {
                  TipoEntidad: this.paramTipo,
                  OrigenTipo: this.paramTipoOrigen,
                  OrigenId: params[PARAM_ID_ORIGEN] || '',
                  TipoDespliegue: params[PARAM_TIPO_DESPLIEGUE] || '',
                  TransactionId: this.entidades.NewGuid(),
                  Permiso: pcontenido,
                };
              } else {
                this.router.navigateByUrl('/pages/sinacceso');
              }

            }, (e) => {
              this.router.navigateByUrl('/pages/sinacceso');
            }, () => { });


        });
    }
  }

  ngOnInit(): void {
    this.ParamListener();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }
}
