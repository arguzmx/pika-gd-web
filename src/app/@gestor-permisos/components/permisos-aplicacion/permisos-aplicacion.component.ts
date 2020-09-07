import { Component, OnInit, Input } from '@angular/core';
import { Aplicacion } from '../../../@pika/pika-module';

@Component({
  selector: 'ngx-permisos-aplicacion',
  templateUrl: './permisos-aplicacion.component.html',
  styleUrls: ['./permisos-aplicacion.component.scss']
})
export class PermisosAplicacionComponent implements OnInit {

  @Input() aplicacion: Aplicacion;
  constructor() { }

  ngOnInit(): void {
  }

}
