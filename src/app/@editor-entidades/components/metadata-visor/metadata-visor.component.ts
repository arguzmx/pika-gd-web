import { AppLogService } from '../../../@pika/pika-module';
import { EditorEntidadesBase } from './../../model/editor-entidades-base';
import { Component, OnInit, Input } from '@angular/core';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { EntidadesService } from '../../services/entidades.service';
import { TranslateService } from '@ngx-translate/core';
import { IVisorMetadatos } from '../../model/i-visor-metadatos';
import { Router } from '@angular/router';

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
    ts: TranslateService, applog: AppLogService,
    router: Router) {
    super(entidades, applog, router);
  }


  ngOnInit(): void {
  }

}
