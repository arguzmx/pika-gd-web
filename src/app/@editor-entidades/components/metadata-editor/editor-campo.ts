import { Subject } from 'rxjs';
import { Propiedad, Eventos, Evento, AtributoEvento, Operaciones } from '../../../@pika/pika-module';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { FormGroup } from '@angular/forms';
import { EntidadesService } from '../../services/entidades.service';
import { takeUntil } from 'rxjs/operators';

export class EditorCampo {
    propiedad: Propiedad;
    congiguracion: ConfiguracionEntidad;
    group: FormGroup;
    isUpdate: boolean;
    onDestroy$: Subject<void>;

    oculto: boolean = false;

    constructor(public entidades: EntidadesService ) {}


    hookEscuchaEventos() {
        if (this.onDestroy$) {
            console.warn('El listner ya ha sido configurado');
            return;
        }
        this.onDestroy$ = new Subject<void>();
        if (this.recepcionEventos()) {
            this.entidades.ObtieneEventos()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe( ev => {
                console.warn(ev);
                if (ev && ev.Transaccion === this.congiguracion.TransactionId) {
                    // el evento esta en la misma transacción de UI
                    switch (ev.Evento) {
                        case Eventos.AlCambiar:
                            this.eventoAlCambiar(ev);
                            break;
                    }
                }
            });
        } else {
            console.warn('Sin eventos para ' + this.propiedad.Id);
        }
    }

    EmiteEventoCambio(Id: string, Valor:  any, Transaccion: string ) {
        const evt: Evento = {
          Origen: Id,
          Valor: Valor,
          Evento: Eventos.AlCambiar,
          Transaccion: Transaccion,
        };
        this.entidades.EmiteEvento(evt);
      }


    eventoActualizar(ev: Evento, a: AtributoEvento) {
        console.warn("eventoActualizar no implementado");
    }

    eventoMostrar(ev: Evento, a: AtributoEvento) {
        const expresion = a.Parametro.replace('{0}', String(ev.Valor));
        this.oculto = !this.evaluar(expresion);
    }


    private evaluar(expresion: string):  any {
        // tslint:disable-next-line: ban
        return eval(expresion);
    }

    private eventoAlCambiar(ev: Evento) {
        this.propiedad.AtributosEvento.forEach( a => {
            if (ev.Origen === a.Entidad ) {
                switch (a.Operacion) {
                    case Operaciones.Actualizar:
                        this.eventoActualizar(ev, a);
                        break;

                    case Operaciones.Mostrar:
                        this.eventoMostrar(ev, a);
                        break;
                }
            }
        })
    }

    destroy() {
        if (this.onDestroy$) {
            this.onDestroy$.next(null);
            this.onDestroy$.complete();
        }
    }

    // Determina si la entidad recibe eventos
    recepcionEventos():  boolean {
        if (this.propiedad.AtributosEvento &&
            this.propiedad.AtributosEvento.length > 0) {
                return true;
            }
        return false;
    }

}
