import { PermisosService } from './../../services/permisos.service';
import { Component, OnInit } from '@angular/core';
import { Aplicacion } from '../../../@pika/pika-module';

@Component({
  selector: 'ngx-permisos-host',
  templateUrl: './permisos-host.component.html',
  styleUrls: ['./permisos-host.component.scss'],
  providers: [PermisosService]
})
export class PermisosHostComponent implements OnInit {


  public aplicaciones: Aplicacion[];

  constructor(private permisos: PermisosService) { }

  ngOnInit(): void {
    this.ObtieneAplicaciones();
  }

  ObtieneAplicaciones(): void {
      this.permisos.ObtenerAplicaciones()
      .subscribe(  apps => {
        console.log(apps);
        this.aplicaciones = apps;
      });
  }

  ObtieneRoles(): void {

  }

  ObtienePermisoRol(rolId: string): void {

  }


}
