import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { AppLogService } from '../../../services/app-log/app-log.service';
import { ActDominioOU } from '../../model/act-dominio-ou';
import { EstadoOCR } from '../../model/estado-ocr';
import { ApiConfiguracion } from '../../services/api-configuracion';

@Component({
  selector: "ngx-configuracion-aplicacion",
  templateUrl: "./configuracion-aplicacion.component.html",
  styleUrls: ["./configuracion-aplicacion.component.scss"],
  providers: [ApiConfiguracion],
})
export class ConfiguracionAplicacionComponent implements OnInit {
  cargandoSalud: boolean = true;
  domainForm: FormGroup;
  estadoOCR: EstadoOCR = { Completo: 0, Error: 0, Pendiente: 0 };
  public T: Traductor;

  constructor(
    formBuilder: FormBuilder,
    ts: TranslateService,
    private applog: AppLogService,
    private api: ApiConfiguracion
  ) {
    this.T = new Traductor(ts);
    this.domainForm = formBuilder.group({
      dominio: ["", [Validators.required, Validators.minLength(2)]],
      unidad: ["", [Validators.required, Validators.minLength(2)]],
    });
  }

  estadoCargaSalud(estadoCarga: boolean) {
    this.cargandoSalud = !estadoCarga;
  }

  ngOnInit(): void {
    this.CargaTraducciones();
    this.DatosIniciales();
  }

  onDominioUpdate() {
    this.api
      .ActualizaDominioOU(
        this.domainForm.get("dominio").value,
        this.domainForm.get("unidad").value
      )
      .pipe(first())
      .subscribe(
        (r) => {
          this.ErrorDominioOU(0);
        },
        (err) => {
          this.ErrorDominioOU(parseInt(err.status));
        }
      );
  }

  ErrorDominioOU(err: number) {
    switch (err) {
      case 0:
        this.applog.ExitoT("ui.dominio-unidad-cambio-ok");
        break;

      default:
        this.applog.FallaT("ui.dominio-unidad-cambio-err");
        break;
    }
  }

  private CargaTraducciones() {
    this.T.ts = [
      "ui.actualizar",
      "titulo.configuracion-sistema",
      "ui.dominio-actualizar",
      "ui.dominio-dominio-actualizar",
      "ui.dominio-unidad-actualizar",
      "componentes.monitor-salud.titulo",
      "componentes.monitor-salud.indexado",
      "componentes.monitor-salud.indexado-completo",
      "componentes.monitor-salud.indexado-pendiente",
      "componentes.monitor-salud.indexado-error",
      "componentes.monitor-salud.reprocesar-errores",
      'componentes.monitor-salud.refrescar-ocr'
    ];
    this.T.ObtenerTraducciones();
  }

  private DatosIniciales() {
    const dominioOu = this.api.ObtieneDominioOU().pipe(first());
    const estadoOCR = this.api.ObtieneEstadoOCR().pipe(first());

    forkJoin([dominioOu, estadoOCR]).subscribe((resultados) => {
      this.estadoOCR = resultados[1];
      this.updateDominioOU(resultados[0]);
    });
  }

  updateDominioOU(data: ActDominioOU) {
    this.domainForm.get("dominio").setValue(data.Dominio);
    this.domainForm.get("unidad").setValue(data.OU);
  }


  onRefreshOCR(notificar: boolean) {
    this.api.ObtieneEstadoOCR().pipe(first()).subscribe(r=> {
      this.estadoOCR = r;
      if(notificar) {
        this.applog.ExitoT("componentes.monitor-salud.refrescar-ocr-ok");
      }
    }, (e) => {
      this.applog.ExitoT("componentes.monitor-salud.refrescar-ocr-err");
    });
  }

  onReprocesarOCRError() {
    this.api
      .ReiniciaOCRErrores()
      .pipe(first())
      .subscribe(
        (x) => {
          this.applog.ExitoT("componentes.monitor-salud.reindexado-error-ok");
          this.onRefreshOCR(false);
        },
        (e) => {
          this.applog.FallaT("componentes.monitor-salud.reindexado-error-err");
        }
      );
  }
}
