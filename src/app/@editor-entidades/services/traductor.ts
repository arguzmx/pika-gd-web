import { TranslateService } from '@ngx-translate/core/lib/translate.service';
import { AsyncSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';

export class Traductor {
  constructor(public translate: TranslateService) {}

  // Claves para obtener la traducción
  public ts: string[];

  // Objeto resultante de la traduccion
  public t: object;

  // Obtiene las tradcucciones
  ObtenerTraducciones(interpolateParams?: Object): void {
    this.translate
      .get(this.ts, interpolateParams)
      .pipe(first())
      .subscribe((res) => {
        this.t = res;
      });
  }


  ObtenerTraduccion(ids: string[], interpolateParams?: Object): Observable<string[]> {
    const subject = new AsyncSubject<any>();
    this.translate
    .get(ids, interpolateParams)
    .pipe(first())
    .subscribe((res) => {
      subject.next(res);
      subject.complete();
    }, () => {
      subject.next(null);
      subject.complete();
    }) ;
    return subject;
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
