import { environment } from './../../../../environments/environment';
import { takeUntil, first } from 'rxjs/operators';
import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SesionQuery } from '../../../@pika/pika-module';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: 'footer.component.html',

})
export class FooterComponent implements OnDestroy {
  private onDestroy$ = new Subject<any>();
  // Claves para obtener la traducción
  ts: string[];
  // Objeto resultante de la traduccion
  t: object;

  // Etiquetas de organización
  etiquetaDominio: string = '';
  etiquetaUO: string = '';

  constructor(
    private translate: TranslateService,
    private  sesionQ: SesionQuery) {
    this.CargaTraducciones();
    this.CambiosSesion();
  }

  // VErifica los cambios en las propieades de sesión
  private CambiosSesion() {
    this.sesionQ.preferencias$.pipe(takeUntil(this.onDestroy$))
    .subscribe((p) => {
      this.ActualizaFooter();
    });

    this.sesionQ.dominios$.pipe(takeUntil(this.onDestroy$))
    .subscribe((ds) => {
      this.ActualizaFooter();
    });
  }

  private ActualizaFooter() {
    this.etiquetaDominio = '';
    this.etiquetaUO = '';
    const p = this.sesionQ.preferencias;

    if (p.Dominio) {
      const d = this.sesionQ.dominios.find( x => x.Id === p.Dominio);
      if (d) {
        this.etiquetaDominio = d.Nombre;
        const u = d.UnidadesOrganizacionales.find( x => x.Id === p.UnidadOrganizacional);
        this.etiquetaUO = u ? u.Nombre : '';
      }
    }
  }

  private CargaTraducciones() {
    this.ts = ['ui.ubicacion-org'];
    this.ObtenerTraducciones();
  }

  // Obtiene las tradcucciones
  ObtenerTraducciones(): void {
    this.translate
      .get(this.ts)
      .pipe(first())
      .subscribe((res) => {
        this.t = res;
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }
}
