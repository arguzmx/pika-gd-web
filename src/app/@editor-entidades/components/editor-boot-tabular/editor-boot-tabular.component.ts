import { TipoDespliegueVinculo } from './../../../@pika/metadata/entidad-vinculada';
import { PARAM_ID_ORIGEN, PARAM_TIPO_DESPLIEGUE } from './../../model/constantes';
import { EntidadesService } from './../../services/entidades.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { PARAM_TIPO, PARAM_TIPO_ORIGEN } from '../../model/constantes';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CacheEntidadesService } from '../../services/cache-entidades.service';

@Component({
  selector: 'ngx-editor-boot-tabular',
  templateUrl: './editor-boot-tabular.component.html',
  styleUrls: ['./editor-boot-tabular.component.scss'],
  providers: [EntidadesService, CacheEntidadesService],
})
export class EditorBootTabularComponent implements OnInit, OnDestroy {
  private onDestroy$: Subject<void> = new Subject<void>();
  config: ConfiguracionEntidad;

  constructor( private entidades: EntidadesService,
    private route: ActivatedRoute) { }

  public ParamListener(): void {
    this.route.queryParams
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((params) => {
      this.config = {
        TipoEntidad: params[PARAM_TIPO] || '',
        OrigenTipo: params[PARAM_TIPO_ORIGEN] || '',
        OrigenId: params[PARAM_ID_ORIGEN] || '',
        TipoDespliegue: params[PARAM_TIPO_DESPLIEGUE] || '',
        TransactionId: this.entidades.NewGuid(),
      };
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
