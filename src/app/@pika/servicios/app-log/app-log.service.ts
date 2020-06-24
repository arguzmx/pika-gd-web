import { Injectable } from '@angular/core';
import { NbToastrService, NbGlobalLogicalPosition, NbIconConfig } from '@nebular/theme';
import { IAppLog } from './iapp-log';
import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppLogService implements IAppLog {

  constructor(private toastrService: NbToastrService,
    private translate: TranslateService) { }

  InformacionT(clave: string, titulo?: string, interpolateParams?: Object): void {
    if (!(titulo)) titulo = 'editor-pika.mensajes.msg-informacion';
    this.translate.get( [titulo, clave] , interpolateParams).pipe(first())
      .subscribe((res: any) => {
      this.Informacion( res[titulo], res[clave]);
    });
  }

  ExitoT(clave: string, titulo?: string, interpolateParams?: Object): void {
    if (!(titulo)) titulo = 'editor-pika.mensajes.msg-exito';
    this.translate.get( [titulo, clave] , interpolateParams).pipe(first())
      .subscribe((res: any) => {
      this.Exito( res[titulo], res[clave]);
  });
  }

  AdvertenciaT(clave: string, titulo?: string, interpolateParams?: Object): void {
    if (!(titulo)) titulo = 'editor-pika.mensajes.msg-advertencia';
    this.translate.get( [titulo, clave] , interpolateParams).pipe(first())
      .subscribe((res: any) => {
      this.Advertencia( res[titulo], res[clave]);
    });
  }

  FallaT(clave: string, titulo?: string, interpolateParams?: Object): void {
    if (!(titulo)) titulo = 'editor-pika.mensajes.msg-error';
    this.translate.get( [titulo, clave] , interpolateParams).pipe(first())
      .subscribe((res: any) => {
      this.Falla( res[titulo], res[clave]);
  });
  }

  Informacion(titulo: string, mensaje: string): void {
    if (mensaje) this.showToast(titulo, mensaje, 'info-outline');
  }

  Exito(titulo: string, mensaje: string): void {
    if (mensaje) this.showToast(titulo, mensaje, 'checkmark-circle-2-outline');
  }

  Advertencia(titulo: string, mensaje: string): void {
    if (mensaje) this.showToast(titulo, mensaje, 'alert-circle-outline');
  }

  Falla(titulo: string, mensaje: string): void {
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
