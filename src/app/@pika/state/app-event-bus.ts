import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { EventoAplicacion } from '../eventos/evento-aplicacion'

export const EventoCerrarPlugins: EventoAplicacion = {
    tema: 'cerrarplugins', id: '', payload :[]
}
export const VISOR: string = 'visorcontenido';

@Injectable({ providedIn: 'root' })
export class AppEventBus  { 


    elementosContenido: EventoAplicacion[] = [];

    private  eventSubject: Subject<EventoAplicacion>;

    constructor( ){
        this.eventSubject = new Subject<EventoAplicacion>();
    }



    public EliminaElementoContenido(id: string) {
        const idx = this.elementosContenido.findIndex(x=>x.id  == id );
        if (idx > -1) {
            this.elementosContenido.splice(idx,1);
        }
    }

    public EmitirCerrarPlugins() {
        this.EmiteEvento(EventoCerrarPlugins);
    }

    public EmiteEvento(ev: EventoAplicacion) {
        switch(ev.tema) {
            case VISOR:
                if(this.elementosContenido.findIndex(x=>x.id == ev.id)<0){
                    this.elementosContenido.push(ev);
                }
                break;
        }
        this.eventSubject.next(ev);
    }

    public LeeEventos(): Observable<EventoAplicacion> {
        return this.eventSubject;
    }
    

}