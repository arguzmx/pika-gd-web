import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Aplicacion } from '../../../@pika/seguridad';

@Component({
  selector: 'ngx-eventos-config-aplicacion',
  templateUrl: './eventos-config-aplicacion.component.html',
  styleUrls: ['./eventos-config-aplicacion.component.scss']
})
export class EventosConfigAplicacionComponent implements OnInit {
  @Input() aplicaciones: Aplicacion[] = [];
  constructor() { }

  ngOnInit(): void {
    
  }
}
