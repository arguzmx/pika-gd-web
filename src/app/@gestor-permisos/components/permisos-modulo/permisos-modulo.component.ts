import { Component, OnInit, Input, OnDestroy, AfterViewInit } from '@angular/core';
import {
  ModuloAplicacion,
  PermisoAplicacion,
} from '../../../@pika/pika-module';
import { FormGroup, FormControl } from '@angular/forms';
import { PermisosService, PermisosEnum } from '../../services/permisos.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-permisos-modulo',
  templateUrl: './permisos-modulo.component.html',
  styleUrls: ['./permisos-modulo.component.scss'],
})
export class PermisosModuloComponent implements OnInit, OnDestroy {
  @Input() modulo: ModuloAplicacion;
  @Input() entidadSeleccionadaId: string;

  permisosUI: PermisoAplicacion[] = [];
  checked = false;

  formPermisosModulo: FormGroup;

  tipoPermiso = PermisosEnum;
  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioPermisos: PermisosService) {}

  ngOnInit(): void {
    this.EscuchaPermisoAplicacion();
    this.EscuchaPermisosModulo();
    this.IniciaFormPermisoModulo();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  IniciaFormPermisoModulo () {
    this.formPermisosModulo = new FormGroup({
      id: new FormControl(this.modulo.Id),
      leer: new FormControl(),
      escribir: new FormControl(),
      eliminar: new FormControl(),
      administrar: new FormControl(),
      ejecutar: new FormControl(),
      denegar: new FormControl(),
    });
  }


  EscuchaPermisoAplicacion() {
    this.servicioPermisos.ObtienePermisoAplicacion()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(permisoApp => {
      if (permisoApp && permisoApp.aplicacionId === this.modulo.AplicacionId) {
          let checked;
          switch (permisoApp.tipo) {
            case PermisosEnum.denegar:  checked = !this.formPermisosModulo.get('denegar').value; break;
            case PermisosEnum.leer: checked = !this.formPermisosModulo.get('leer').value; break;
            case PermisosEnum.escribir: checked = !this.formPermisosModulo.get('escribir').value; break;
            case PermisosEnum.eliminar: checked = !this.formPermisosModulo.get('eliminar').value; break;
            case PermisosEnum.ejecutar: checked = !this.formPermisosModulo.get('ejecutar').value; break;
            case PermisosEnum.administrar: checked = !this.formPermisosModulo.get('administrar').value; break;
          }
          this.EstablecePermisoModulo(checked, permisoApp.tipo);
      }
    });
  }

  EscuchaPermisosModulo() {
    this.servicioPermisos
      .ObtienePermisosModulo()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((permisos) => {
        if (permisos) {
          this.permisosUI = permisos;
          const p = this.permisosUI.find((x) => x.ModuloId === this.modulo.Id);
          if (p) {
            this.formPermisosModulo.patchValue({
              leer: p.Leer,
              escribir: p.Escribir,
              eliminar: p.Eliminar,
              administrar: p.Admin,
              ejecutar: p.Ejecutar,
              denegar: p.NegarAcceso,
            });
            this.NegarAcceso(p, p.NegarAcceso);
          }
        }
      });
  }

  EstablecePermisoModulo(checked, tipo) {
    const index = this.permisosUI.findIndex( x => x.ModuloId === this.modulo.Id &&
                                    x.AplicacionId === this.modulo.AplicacionId);
    const p = this.permisosUI[index];
    if (p) {
      switch (tipo) {
        case PermisosEnum.denegar:
          p.NegarAcceso = checked;
          this.NegarAcceso(p, checked);
        break;
        case PermisosEnum.leer: p.Leer = checked; break;
        case PermisosEnum.escribir: p.Escribir = checked; break;
        case PermisosEnum.eliminar: p.Eliminar = checked; break;
        case PermisosEnum.administrar: p.Admin = checked; break;
        case PermisosEnum.ejecutar: p.Ejecutar = checked; break;
      }
    this.servicioPermisos.EstablecePermisosModulo(this.permisosUI);
    }
  }

  NegarAcceso(permisosModulo: PermisoAplicacion, denegar: boolean) {
    if (this.modulo.Id === permisosModulo.ModuloId) {
      if (denegar) {
        permisosModulo.Leer = false;
        permisosModulo.Escribir = false;
        permisosModulo.Ejecutar = false;
        permisosModulo.Eliminar = false;
        permisosModulo.Admin = false;

        this.formPermisosModulo.get('leer').disable();
        this.formPermisosModulo.get('escribir').disable();
        this.formPermisosModulo.get('eliminar').disable();
        this.formPermisosModulo.get('administrar').disable();
        this.formPermisosModulo.get('ejecutar').disable();

      } else {
        this.formPermisosModulo.get('leer').enable();
        this.formPermisosModulo.get('escribir').enable();
        this.formPermisosModulo.get('eliminar').enable();
        this.formPermisosModulo.get('administrar').enable();
        this.formPermisosModulo.get('ejecutar').enable();
      }
    }
  }
}



