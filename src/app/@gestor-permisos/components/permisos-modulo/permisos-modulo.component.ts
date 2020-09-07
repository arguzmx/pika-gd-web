import { Component, OnInit, Input } from '@angular/core';
import { ModuloAplicacion, PermisoAplicacion } from '../../../@pika/pika-module';

@Component({
  selector: 'ngx-permisos-modulo',
  templateUrl: './permisos-modulo.component.html',
  styleUrls: ['./permisos-modulo.component.scss']
})
export class PermisosModuloComponent implements OnInit {

  @Input() modulo: ModuloAplicacion;
  @Input() permisos: PermisoAplicacion;

  constructor() { }

  ngOnInit(): void {
  }

}
