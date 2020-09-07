import { ConfiguracionEntidad } from './../../model/configuracion-entidad';
import { PARAM_TIPO_JERARQUICO, PARAM_TIPO_ARBOL_JERARQUICO,
  PARAM_ID_JERARQUICO, PARAM_TIPO_CONTENIDO_JERARQUICO, PARAM_TIPO_DESPLIEGUE } from './../../model/constantes';
import { EntidadesService, CONTEXTO } from './../../services/entidades.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CacheEntidadesService } from '../../services/cache-entidades.service';
import { ConfiguracionEntidadJerarquica } from '../../model/configuracion-entidad-jerarquica';

@Component({
  selector: 'ngx-editor-boot-jerarquico',
  templateUrl: './editor-boot-jerarquico.component.html',
  styleUrls: ['./editor-boot-jerarquico.component.scss'],
  providers: [EntidadesService, CacheEntidadesService],
})
export class EditorBootJerarquicoComponent implements  OnInit, OnDestroy {

  private onDestroy$: Subject<void> = new Subject<void>();
  config: ConfiguracionEntidadJerarquica;

  constructor( private entidades: EntidadesService,
    private route: ActivatedRoute) { }

    private EstablecePropiedadContextual(c: ConfiguracionEntidad): void {
      if (c.OrigenTipo && c.OrigenId ) {
        this.entidades
        .SetCachePropiedadContextual(c.OrigenTipo, CONTEXTO, '', c.OrigenId);
      }
      this.entidades.printCache();
    }

  public ParamListener(): void {
    this.route.queryParams
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((params) => {
      this.config = {
        ConfiguracionJerarquia : {
              OrigenTipo:  params[PARAM_TIPO_JERARQUICO] || '',
              TipoEntidad: params[PARAM_TIPO_ARBOL_JERARQUICO] || '',
              OrigenId: params[PARAM_ID_JERARQUICO] || '',
              TransactionId: this.entidades.NewGuid(),
              TipoDespliegue: params[PARAM_TIPO_DESPLIEGUE] || '',
        },
        ConfiguracionContenido : {
          TipoEntidad: params[PARAM_TIPO_CONTENIDO_JERARQUICO] || '',
          OrigenTipo: '',
          OrigenId: '',
          TransactionId: this.entidades.NewGuid(),
          TipoDespliegue: params[PARAM_TIPO_DESPLIEGUE] || '',
        },
      };
    this.entidades
      .SetCachePropiedadContextual('PadreId', CONTEXTO, '', null);
     this.EstablecePropiedadContextual(this.config.ConfiguracionJerarquia);
     this.EstablecePropiedadContextual(this.config.ConfiguracionContenido);
    });
  }

  ngOnInit(): void {
    this.ParamListener();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

}
