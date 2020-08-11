import { ConfiguracionEntidad } from './../../model/configuracion-entidad';
import { PARAM_ID_ORIGEN } from './../../model/constantes';
import { EntidadesService, CONTEXTO } from './../../services/entidades.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PARAM_TIPO, PARAM_TIPO_ORIGEN } from '../../model/constantes';
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
              TipoEntidad: 'ElementoClasificacion',
              OrigenTipo: 'CuadroClasificacion',
              OrigenId: 'id',
              TransactionId: this.entidades.NewGuid(),
        },
        ConfiguracionContenido : {
          TipoEntidad: 'EntradaClasificacion',
          OrigenTipo: '',
          OrigenId: '',
          TransactionId: this.entidades.NewGuid(),
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
