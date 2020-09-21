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
export class PermisosAplicacionComponent implements OnInit, OnDestroy {
  @Input() aplicacion: Aplicacion;
  @Input() entidadSeleccionadaId: string;
  permiso: PermisoAplicacion;
  tipoPermiso = PermisosEnum;

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioPermisos: PermisosService) { }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  EstablecePermisoApp(tipo: PermisosEnum) {
    this.servicioPermisos.EstablecePermisoAplicacion(this.aplicacion.Id, tipo);
  }
}
