import { FiltroConsulta } from './../../../@pika/consulta/filtro-consulta';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { ConfigCampo } from './search-fields/config-campo';


@Injectable()
    export class FormSearchService {
    private EliminaFiltroSubject = new BehaviorSubject(null);
    private EliminaTodosFiltrosSubject = new BehaviorSubject(null);
    private FiltrosSubject = new BehaviorSubject([]);
    private FiltrosValidosSubject = new BehaviorSubject(false);

    private filtros: FiltroConsulta[] = [];


    // Eventos
    // ------------------------------------------------------

    ObtieneFiltrosEliminados(): Observable<ConfigCampo> {
        return this.EliminaFiltroSubject.asObservable();
    }

    ObtieneEliminarTodos(): Observable<any> {
        return this.EliminaTodosFiltrosSubject.asObservable();
    }

    ObtieneFiltros(): Observable<any> {
        return this.FiltrosSubject.asObservable();
    }

    ObtieneFiltrosValidos(): Observable<any> {
        return this.FiltrosValidosSubject.asObservable();
    }


    // Setters
    // ------------------------------------------------------

    EstablecerFiltrosValidos(): void {
        this.FiltrosValidosSubject.next(true);
    }

    InvalidarFiltro(filtro: FiltroConsulta): void {
        const index = this.filtros.indexOf(filtro, 0);
            if (index > -1) {
              this.filtros.splice(index, 1);
              this.FiltrosSubject.next(this.filtros);
            }
    }

    EliminarFiltro(config: ConfigCampo) {
        this.EliminaFiltroSubject.next(config);

        const filtro = this.filtros.filter( x => x.Id === config.name )[0];
        if (filtro) {
            const index = this.filtros.indexOf(filtro, 0);
            if (index > -1) {
              this.filtros.splice(index, 1);
              this.FiltrosSubject.next(this.filtros);
            }
        }
    }

    EliminarTodosFiltros() {
        this.EliminaTodosFiltrosSubject.next(true);
        this.filtros = [];
        this.FiltrosSubject.next(this.filtros);
    }


    AgregarFiltro(filtro: FiltroConsulta) {
        const index = this.filtros.indexOf(filtro, 0);
        if (index > -1) {
          this.filtros.splice(index, 1);
        }
        this.filtros.push(filtro);
        this.FiltrosSubject.next(this.filtros);
    }

}
