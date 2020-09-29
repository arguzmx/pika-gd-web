import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Aplicacion, PermisoAplicacion } from '../../../@pika/pika-module';
import { FormGroup, FormControl } from '@angular/forms';
import { PermisosService, PermisosEnum } from '../../services/permisos.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-permisos-aplicacion',
  templateUrl: './permisos-aplicacion.component.html',
  styleUrls: ['./permisos-aplicacion.component.scss']
})
export class PermisosAplicacionComponent implements OnInit {
  @Input() aplicacion: Aplicacion;
  @Input() entidadSeleccionadaId: string;

  permiso: PermisoAplicacion;
  tipoPermiso = PermisosEnum;

  constructor(private servicioPermisos: PermisosService) { }

  ngOnInit(): void {}

  EstablecePermisoApp(tipo: PermisosEnum) {
    this.servicioPermisos.EstablecePermisoAplicacion(this.aplicacion.Id, tipo);
  }
}
