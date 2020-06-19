import { Injectable } from '@angular/core';
import { NbToastrService, NbGlobalLogicalPosition, NbIconConfig } from '@nebular/theme';
import { IAppLog } from './iapp-log';

@Injectable({
  providedIn: 'root',
})
export class AppLogService implements IAppLog {

  constructor(private toastrService: NbToastrService) { }

  Informacion(titulo: string, mensaje: string): void {
    titulo = titulo === '' ? 'Información' : titulo;
    if (mensaje) this.showToast(titulo, mensaje, 'info-outline');
  }

  Exito(titulo: string, mensaje: string): void {
    titulo = titulo === '' ? 'Finalizado' : titulo;
    if (mensaje) this.showToast(titulo, mensaje, 'checkmark-circle-2-outline');
  }

  Advertencia(titulo: string, mensaje: string): void {
    titulo = titulo === '' ? 'Advertencia' : titulo;
    if (mensaje) this.showToast(titulo, mensaje, 'alert-circle-outline');
  }

  Falla(titulo: string, mensaje: string): void {
      titulo = titulo === '' ? 'Error' : titulo;
      if (mensaje) this.showToast(titulo, mensaje, 'close-circle-outline');
  }

  private showToast(t: string, m: string, i: string) {
    this.toastrService.show(
      `${t}`,
      `${m}`,
      { icon: i , iconPack: 'eva',	limit: 3,
      position: NbGlobalLogicalPosition.BOTTOM_END, preventDuplicates: false });

  }
}
