import { AppLogService } from './../../@pika/servicios/app-log/app-log.service';
import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
export class ComponenteBase {

    constructor (public appLog: AppLogService, public translate: TranslateService) {}

    // Claves para obtener la traducción
    ts: string[];

    // Objeto resultante de la traduccion
    t: object;

    // Obtiene las tradcucciones
    ObtenerTraducciones(): void {
        this.translate.get(this.ts).pipe(first()).subscribe ( res => {
          this.t = res;
        });
    }
}
