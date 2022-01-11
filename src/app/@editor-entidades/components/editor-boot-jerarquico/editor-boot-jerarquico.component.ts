import { PermisoAplicacion } from './../../../@pika/seguridad/permiso-aplicacion';
import { ConfiguracionEntidad } from './../../model/configuracion-entidad';
import {
  PARAM_TIPO_JERARQUICO, PARAM_TIPO_ARBOL_JERARQUICO,
  PARAM_ID_JERARQUICO, PARAM_TIPO_CONTENIDO_JERARQUICO, PARAM_TIPO_DESPLIEGUE,
} from './../../model/constantes';
import { EntidadesService, CONTEXTO } from './../../services/entidades.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { CacheEntidadesService } from '../../services/cache-entidades.service';
import { ConfiguracionEntidadJerarquica } from '../../model/configuracion-entidad-jerarquica';
import { SesionStore, TipoDespliegueVinculo, TipoSeguridad } from '../../../@pika/pika-module';
import { CacheFiltrosBusqueda } from '../../services/cache-filtros-busqueda';
import { ServicioListaMetadatos } from '../../services/servicio-lista-metadatos';

@Component({
  selector: 'ngx-editor-boot-jerarquico',
  templateUrl: './editor-boot-jerarquico.component.html',
  styleUrls: ['./editor-boot-jerarquico.component.scss'],
  providers: [EntidadesService, CacheEntidadesService, CacheFiltrosBusqueda, ServicioListaMetadatos],
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

  private paramTipoArbolJerarquico: string;
  private paramTipoContenidoJerarquico: string;
  private paramTipoJerarquico: string;
  private paramTipoDespliegue: TipoDespliegueVinculo;

  public ParamListener(): void {

    const rutas = <any[]>this.route.snapshot.data['entidadesResolver'];

    if (rutas.length > 0) {
      this.sesionStore.setRutasTipo(rutas);
      this.route.queryParams
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((params) => {
        this.paramTipoArbolJerarquico = (params[PARAM_TIPO_ARBOL_JERARQUICO] || '').toLowerCase();
        this.paramTipoContenidoJerarquico = (params[PARAM_TIPO_CONTENIDO_JERARQUICO] || '').toLowerCase();
        this.paramTipoJerarquico = (params[PARAM_TIPO_JERARQUICO] || '').toLowerCase();
        this.paramTipoDespliegue = params[PARAM_TIPO_DESPLIEGUE];

          forkJoin({
            arbol: this.entidades.ObtieneMetadatos(this.paramTipoArbolJerarquico),
            contenido: this.entidades.ObtieneMetadatos(this.paramTipoContenidoJerarquico)  })
            .subscribe( datos => {
              let parbol: PermisoAplicacion = null;
              let pcontenido: PermisoAplicacion = null;
              let permisos = true;


              if(datos.contenido.TipoSeguridad == TipoSeguridad.AlIngreso) {
                this.entidades.GetACL(datos.contenido.Tipo, params[PARAM_ID_JERARQUICO]).pipe(first()).subscribe(mask => {
                  parbol = this.entidades.CreaPermiso(datos.arbol.TokenApp, datos.arbol.TokenMod, mask);
                  pcontenido = this.entidades.CreaPermiso(datos.contenido.TokenApp, datos.contenido.TokenMod, mask);
              
                  parbol.PermiteAltas = datos.arbol.PermiteAltas;
                  parbol.PermiteCambios = datos.arbol.PermiteCambios;
                  parbol.PermiteBajas = datos.arbol.PermiteBajas;
                  pcontenido.PermiteAltas = datos.contenido.PermiteAltas;
                  pcontenido.PermiteCambios = datos.contenido.PermiteCambios;
                  pcontenido.PermiteBajas = datos.contenido.PermiteBajas;
                  
                  permisos = permisos &&  this.entidades.PermitirAccesoACL(parbol);
                  permisos = permisos &&  this.entidades.PermitirAccesoACL(pcontenido);
                  
                  this.GotoEntidad(permisos, parbol, pcontenido, params[PARAM_ID_JERARQUICO] || '');

                }, (err)=> {this.router.navigateByUrl('/pages/sinacceso');});
              } else {
                if (datos.arbol.TokenApp && datos.arbol.TokenMod) {
                  parbol = this.entidades.ObtienePermiso(datos.arbol.TokenApp, datos.arbol.TokenMod);
                  parbol.PermiteAltas = datos.arbol.PermiteAltas;
                  parbol.PermiteCambios = datos.arbol.PermiteCambios;
                  parbol.PermiteBajas = datos.arbol.PermiteBajas;
                  permisos = permisos &&  this.entidades.PermitirAccesoACL(parbol);
                }
  
                if (datos.contenido.TokenApp && datos.contenido.TokenMod) {
                  pcontenido = this.entidades.ObtienePermiso(datos.contenido.TokenApp, datos.contenido.TokenMod);
                  pcontenido.PermiteAltas = datos.contenido.PermiteAltas;
                  pcontenido.PermiteCambios = datos.contenido.PermiteCambios;
                  pcontenido.PermiteBajas = datos.contenido.PermiteBajas;
                  permisos = permisos &&  this.entidades.PermitirAccesoACL(pcontenido);
                }
                this.GotoEntidad(permisos, parbol, pcontenido, params[PARAM_ID_JERARQUICO] || '');
              }


            }, (e)  => {
              this.router.navigateByUrl('/pages/sinacceso');
            } , () => {});

        });
    }
  }

  private GotoEntidad(permisos: boolean, parbol :PermisoAplicacion, pcontenido: PermisoAplicacion, OrigenJerarquico: string) {
    if (permisos) {
      this.config = {
        ConfiguracionJerarquia: {
          OrigenTipo: this.paramTipoJerarquico,
          OrigenId: OrigenJerarquico, 
          TipoEntidad: this.paramTipoArbolJerarquico,
          TransactionId: this.entidades.NewGuid(),
          TipoDespliegue: this.paramTipoDespliegue,
          Permiso: parbol,
        },
        ConfiguracionContenido: {
          TipoEntidad: this.paramTipoContenidoJerarquico,
          OrigenTipo: this.paramTipoJerarquico,
          OrigenId: '', 
          TransactionId: this.entidades.NewGuid(),
          TipoDespliegue: this.paramTipoDespliegue,
          Permiso: pcontenido,
        },
      };

    this.entidades
      .SetCachePropiedadContextual('PadreId', CONTEXTO, '', null);
    this.EstablecePropiedadContextual(this.config.ConfiguracionJerarquia);
    this.EstablecePropiedadContextual(this.config.ConfiguracionContenido);

    } else {
      this.router.navigateByUrl('/pages/sinacceso');
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
