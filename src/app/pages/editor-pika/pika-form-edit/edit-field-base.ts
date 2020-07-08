import { EditorService } from './../services/editor-service';
import { Evento, Eventos } from '../../../@pika/metadata/atributo-evento';

export class EditFieldBase {
    constructor (public editorService: EditorService) {

    }

    EmiteEventoCambio(Id: string, Valor:  any) {
        const evt: Evento = {
          Origen: Id,
          Valor: Valor,
          Evento: Eventos.AlCambiar,
        };
        this.editorService.EmiteEvento(evt);
      }



}
