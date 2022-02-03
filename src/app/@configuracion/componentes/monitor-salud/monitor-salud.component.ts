import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { first } from "rxjs/operators";
import { Traductor } from "../../../@editor-entidades/editor-entidades.module";
import { AppLogService } from "../../../@pika/servicios";
import { ReporteSalud } from "../../model/reporte-salud";
import { ApiConfiguracion } from "../../services/api-configuracion";

@Component({
  selector: "ngx-monitor-salud",
  templateUrl: "./monitor-salud.component.html",
  styleUrls: ["./monitor-salud.component.scss"],
  providers: [ApiConfiguracion],
})
export class MonitorSaludComponent implements OnInit {
  public T: Traductor;

  @Output() DatosListos = new EventEmitter();
  reporte: ReporteSalud = this.reporteVacio();
  constructor(
    private serviciosGenerales: ApiConfiguracion,
    ts: TranslateService,
    private applog: AppLogService
  ) {
    this.T = new Traductor(ts);
    this.CargaTraducciones();
  }

  
  ngOnInit(): void {
    this.DatosListos.emit(false);

    this.serviciosGenerales
      .ObtienePermisoPuntoMontaje()
      .pipe(first())
      .subscribe(
        (data) => {
          this.reporte = data;
          this.DatosListos.emit(true);
        },
        () => {}
      );
  }

  private CargaTraducciones() {
    this.T.ts = [
      'componentes.monitor-salud.identityserver',
      'componentes.monitor-salud.mysql',
      'componentes.monitor-salud.rabbitmq',
      'componentes.monitor-salud.elasticsearch',
    ];
    this.T.ObtenerTraducciones();
  }

  private reporteVacio(): ReporteSalud {
    return {
      status: "",
      totalDuration: "",
      entries: {
        identityserver: {
          data: {},
          duration: "",
          status: "",
        },
        elasticsearch: {
          data: {},
          duration: "",
          status: "",
        },
        rabbitmq: {
          data: {},
          duration: "",
          status: "",
        },
        mysql: {
          data: {},
          duration: "",
          status: "",
        },
      },
    };
  }
}
