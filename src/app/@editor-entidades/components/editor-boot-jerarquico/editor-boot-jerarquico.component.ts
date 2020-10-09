import { ConfiguracionEntidad } from './../../model/configuracion-entidad';
import {
  PARAM_TIPO_JERARQUICO, PARAM_TIPO_ARBOL_JERARQUICO,
  PARAM_ID_JERARQUICO, PARAM_TIPO_CONTENIDO_JERARQUICO, PARAM_TIPO_DESPLIEGUE,
} from './../../model/constantes';
import { EntidadesService, CONTEXTO } from './../../services/entidades.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CacheEntidadesService } from '../../services/cache-entidades.service';
import { ConfiguracionEntidadJerarquica } from '../../model/configuracion-entidad-jerarquica';
import { SesionStore } from '../../../@pika/pika-module';

@Component({
  selector: 'ngx-editor-boot-jerarquico',
  templateUrl: './editor-boot-jerarquico.component.html',
  styleUrls: ['./editor-boot-jerarquico.component.scss'],
  providers: [EntidadesService, CacheEntidadesService],
})
export class EditorBootJerarquicoComponent implements OnInit, OnDestroy {

  private onDestroy$: Subject<void> = new Subject<void>();
  config: ConfiguracionEntidadJerarquica;

  constructor(
    private sesionStore: SesionStore,
    private entidades: EntidadesService,
    private route: ActivatedRoute,
    private router: Router) { }

  private EstablecePropiedadContextual(c: ConfiguracionEntidad): void {
    if (c.OrigenTipo && c.OrigenId) {
      this.entidades
        .SetCachePropiedadContextual(c.OrigenTipo, CONTEXTO, '', c.OrigenId);
    }
    this.entidades.printCache();
  }


  public ParamListener(): void {

    const rutas = <any[]>this.route.snapshot.data['entidadesResolver'];

    if (rutas.length > 0) {
      this.sesionStore.setRutasTipo(rutas);
      this.route.queryParams
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((params) => {

          forkJoin({
            arbol: this.entidades.ObtieneMetadatos(params[PARAM_TIPO_ARBOL_JERARQUICO]),
            contenido: this.entidades.ObtieneMetadatos(params[PARAM_TIPO_CONTENIDO_JERARQUICO])  })
            .subscribe( datos => {
              let parbol = null;
              let pcontenido = null;
              let permisos = true;
              if (datos.arbol.TokenApp && datos.arbol.TokenMod) {
                parbol = this.entidades.ObtienePermiso(datos.arbol.TokenApp, datos.arbol.TokenMod);
                permisos = permisos &&  this.entidades.PermitirAccesoACL(parbol);
              }

              if (datos.contenido.TokenApp && datos.contenido.TokenMod) {
                pcontenido = this.entidades.ObtienePermiso(datos.contenido.TokenApp, datos.contenido.TokenMod);
                permisos = permisos &&  this.entidades.PermitirAccesoACL(pcontenido);
              }


              if (permisos) {
                this.config = {
                  ConfiguracionJerarquia: {
                    OrigenTipo: params[PARAM_TIPO_JERARQUICO] || '',
                    TipoEntidad: params[PARAM_TIPO_ARBOL_JERARQUICO] || '',
                    OrigenId: params[PARAM_ID_JERARQUICO] || '',
                    TransactionId: this.entidades.NewGuid(),
                    TipoDespliegue: params[PARAM_TIPO_DESPLIEGUE] || '',
                    Permiso: parbol,
                  },
                  ConfiguracionContenido: {
                    TipoEntidad: params[PARAM_TIPO_CONTENIDO_JERARQUICO] || '',
                    OrigenTipo: '',
                    OrigenId: '',
                    TransactionId: this.entidades.NewGuid(),
                    TipoDespliegue: params[PARAM_TIPO_DESPLIEGUE] || '',
                    Permiso: pcontenido,
                  },
                };

              this.entidades
                .SetCachePropiedadContextual('PadreId', CONTEXTO, '', null);
              this.EstablecePropiedadContextual(this.config.ConfiguracionJerarquia);
              this.EstablecePropiedadContextual(this.config.ConfiguracionContenido);

              } else {
                this.router.navigateByUrl('/');
              }

            }, (e)  => {
              this.router.navigateByUrl('/');
            } , () => {});

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
