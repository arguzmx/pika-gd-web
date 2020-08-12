import { EntidadesService } from './../services/entidades.service';
import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { AppLogService } from '../../../@pika/servicios/app-log/app-log.service';

export class EditorEntidadesBase {

    constructor(public entidades: EntidadesService, public translate: TranslateService,
      public applog: AppLogService) {}

  // Claves para obtener la traducción
  ts: string[];

  // Objeto resultante de la traduccion
  t: object;


  // Obtiene las tradcucciones
  ObtenerTraducciones(): void {
    this.translate
      .get(this.ts)
      .pipe(first())
      .subscribe((res) => {
        this.t = res;
      });
  }

  ObtieneSingularT(item: string) {
    try {
      let texto = this.t[item.toLowerCase()].toString();
      texto = texto.indexOf('|') > 0 ? texto.split('|')[0] : texto;
      return texto;
    } catch (error) {
      return item;
    }
  }

  ObtienePluralT(item: string) {
    try {
      let texto = this.t[item.toLowerCase()].toString();
      texto = texto.indexOf('|') > 0 ? texto.split('|')[1] : texto;
      return texto;
    } catch (error) {
      return item;
    }
  }

  ObtieneIconoT(item: string) {
    try {
      let texto = this.t[item.toLowerCase()].toString();
      texto = texto.indexOf('|') > 0 ? texto.split('|')[4] : texto;
      return texto;
    } catch (error) {
      return item;
    }
  }

  ObtieneSingular(item: string) {
    try {
      let texto = item;
      texto = texto.indexOf('|') > 0 ? texto.split('|')[0] : texto;
      return texto;
    } catch (error) {
      return item;
    }
  }

  ObtienePlural(item: string) {
    try {
      let texto = item;
      texto = texto.indexOf('|') > 0 ? texto.split('|')[1] : texto;
      return texto;
    } catch (error) {
      return item;
    }
  }

  ObtieneIcono(item: string) {
    try {
      let texto = item;
      texto = texto.indexOf('|') > 0 ? texto.split('|')[4] : texto;
      return texto;
    } catch (error) {
      return item;
    }
  }


}
