import { CacheEntidadesService } from './../../services/cache-entidades.service';
import { EntidadesService } from './../../services/entidades.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-editor-jerarquico',
  templateUrl: './editor-jerarquico.component.html',
  styleUrls: ['./editor-jerarquico.component.scss'],
  providers: [ EntidadesService, CacheEntidadesService ],
})
export class EditorJerarquicoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
