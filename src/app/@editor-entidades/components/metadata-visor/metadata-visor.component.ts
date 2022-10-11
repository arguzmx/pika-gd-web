import { AppEventBus } from './../../../@pika/state/app-event-bus';
import { EditorEntidadesBase } from './../../model/editor-entidades-base';
import { Component, OnInit, Input } from '@angular/core';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { EntidadesService } from '../../services/entidades.service';
import { TranslateService } from '@ngx-translate/core';
import { IVisorMetadatos } from '../../model/i-visor-metadatos';
import { Router } from '@angular/router';
import { DiccionarioNavegacion } from '../../model/i-diccionario-navegacion';
import { AppLogService } from '../../../services/app-log/app-log.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'ngx-metadata-visor',
  templateUrl: './metadata-visor.component.html',
  styleUrls: ['./metadata-visor.component.scss']
})
export class MetadataVisorComponent  extends EditorEntidadesBase
implements IVisorMetadatos, OnInit {

  // Mantiene la configutación de la entidad obtenida por el ruteo
  @Input() config: ConfiguracionEntidad;

  // Cosntructor del componente
  constructor(entidades: EntidadesService,
    ts: TranslateService, applog: AppLogService, appeventBus: AppEventBus,
    diccionarioNavegacion: DiccionarioNavegacion, fb:  FormBuilder,
    router: Router) {
    super(fb, appeventBus, entidades, applog, router, diccionarioNavegacion);
  }


  ngOnInit(): void {
  }

}
