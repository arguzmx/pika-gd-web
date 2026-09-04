import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Aplicacion } from '../../../@pika/seguridad';
import { EventoAuditoriaActivo } from '../../../@pika/seguridad/evento-auditoria-activo';
import { AppLogService } from '../../../services/app-log/app-log.service';
import { BitacoraService } from '../../services/bitacora.service';

@Component({
  selector: 'ngx-eventos-config-host',
  templateUrl: './eventos-config-host.component.html',
  styleUrls: ['./eventos-config-host.component.scss']
})
export class EventosConfigHostComponent implements OnInit {

  formEventos = new FormGroup({});
  app: Aplicacion[] = [];

  constructor(ts: TranslateService,
    private applog: AppLogService,
    private bitacoraService: BitacoraService) { }

  ngOnInit(): void {
    const tmpapp: Aplicacion[] = [];

    const app = this.bitacoraService.ObtenerApp().pipe(first());
    const avevntos = this.bitacoraService.ObtenerAuditables().pipe(first());

    forkJoin([app, avevntos]).subscribe(resultados => {
      const auditables: EventoAuditoriaActivo[] = resultados[1];
      resultados[0].forEach(a => {
        if (a.Modulos.findIndex(m => m.EventosAuditables.length > 0) >= 0) {
          a.Modulos = a.Modulos.sort((a, b) => b.EventosAuditables.length - a.EventosAuditables.length);
          tmpapp.push(a);
        }
      });

      tmpapp.forEach(a=> {

        if(a.Modulos) {
          a.Modulos.forEach(m=> {
              if (m.EventosAuditables) {
                m.EventosAuditables.forEach(v=> {
                  v.Id = `${v.AppId}$${v.ModuloId}$${v.TipoEntidad}$${v.TipoEvento}`;
                  v.Activo = auditables.findIndex(x=>x.AppId == v.AppId && x.ModuloId == v.ModuloId && 
                            x.TipoEntidad == v.TipoEntidad && x.TipoEvento == v.TipoEvento) >= 0;
                })
              }
          })
        }
      });
      this.app = tmpapp;
    });
  }
}
