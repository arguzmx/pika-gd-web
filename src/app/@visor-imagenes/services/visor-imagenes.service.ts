import { first } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, AsyncSubject, BehaviorSubject } from 'rxjs';
import { Documento } from '../model/documento';
import { DocumentosService } from './documentos.service';
import { Pagina } from '../model/pagina';

@Injectable()
export class VisorImagenesService {
  private subjectPaginasSeleccionadas  = new BehaviorSubject<Pagina[]>([]);
  
  constructor(private docService: DocumentosService) { }

  public ObtieneDocumento(DocumentoId: string): Observable<Documento> {
      // Un AsyncSubject devuelve el último valor obtenido ccuando se completa (subject.complete)
      const subject = new  AsyncSubject <Documento>();
      this.docService.ObtieneDocumento(DocumentoId)
      .pipe(first()) // pipe(first()) obtiene SOLO el primer elemento que devuelva un observable
      .subscribe(documento => {
        subject.next(documento); // con .next asigamos un nuevo valor a nuestro subject
      },
      (error) => {
        // En caso de que ocurra un error asignamos el valor null a nuestrp subject
        subject.next(null);
      },
      () => {
        // Una vez que se recie el primer valor u ocurre un error completamos el subjet
        // y así sus sucriptores reciber el último valro obtenido
        subject.complete();
      });

      return subject;
  }



  // Administración de páginas seleccionasas
  // --------------------------------------------------------------
  public EstablecePaginasSeleccionadas(paginas: Pagina[]) {
    this.subjectPaginasSeleccionadas.next(paginas);
  }

  ObtienePaginasSeleccionadas(): Observable<Pagina[]> {
    return this.subjectPaginasSeleccionadas.asObservable();
  }

  // --------------------------------------------------------------
  // --------------------------------------------------------------



}
