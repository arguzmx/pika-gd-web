import { EntidadesService } from './../services/entidades.service';
import { Evento, Eventos } from '../../@pika/pika-module';

export class XMetadataEditorBase {
    constructor (public entidades: EntidadesService) {

    }

    // EmiteEventoCambio(Id: string, Valor:  any, Transaccion: string ) {
    //     const evt: Evento = {
    //       Origen: Id,
    //       Valor: Valor,
    //       Evento: Eventos.AlCambiar,
    //       Transaccion: Transaccion,
    //     };
    //     this.entidades.EmiteEvento(evt);
    //   }

}
