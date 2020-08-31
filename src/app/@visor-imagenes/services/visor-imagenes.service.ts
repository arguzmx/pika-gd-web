import { first } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, AsyncSubject, BehaviorSubject } from 'rxjs';
import { Documento } from '../model/documento';
import { DocumentosService } from './documentos.service';
import { Pagina } from '../model/pagina';
import { resolve } from 'dns';

@Injectable()
export class VisorImagenesService {
  private subjectPaginasSeleccionadas = new BehaviorSubject<Pagina[]>([]);
  private subjectPaginaVisible = new BehaviorSubject<Pagina>(null);

  documento: Documento = null;
  inicioSeleccion: Pagina = null;
  finSeleccion: Pagina = null;

  thumbActivo: Pagina = null;
  thumbSeleccionados: Pagina[] = [];

  constructor(private docService: DocumentosService) {}

  public ObtieneDocumento(DocumentoId: string): Observable<Documento> {
    // Un AsyncSubject devuelve el último valor obtenido ccuando se completa (subject.complete)
    const subject = new AsyncSubject<Documento>();
    this.docService
      .ObtieneDocumento(DocumentoId)
      .pipe(first()) // pipe(first()) obtiene SOLO el primer elemento que devuelva un observable
      .subscribe(
        (documento) => {
          this.documento = documento;

          // ********** prueba ***********
          const aux1 = documento.Paginas;
          for(let i = 0; i <= 2; i++){
            documento.Paginas.push(...aux1);
          }
          console.log(documento.Paginas.length);
          // ********** prueba ***********

          documento.Paginas.sort((a, b) => a.Indice - b.Indice);
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
        }
      );

    return subject;
  }

  // Administración de páginas seleccionadas
  // --------------------------------------------------------------

  public SeleccionShift(p: Pagina) {
    if (!this.inicioSeleccion) this.inicioSeleccion = this.documento.Paginas[0];
    this.finSeleccion = p;
    this.thumbSeleccionados = this.documento.Paginas.filter( x =>
        x.Indice >= this.inicioSeleccion.Indice && x.Indice <= this.finSeleccion.Indice ||
        x.Indice <= this.inicioSeleccion.Indice && x.Indice >= this.finSeleccion.Indice);

      this.subjectPaginasSeleccionadas.next(this.thumbSeleccionados);
  }

  public EstablecerPaginaActiva(p: Pagina) {
    this.thumbActivo = p;
    this.subjectPaginaVisible.next(this.thumbActivo);
  }

  public AdicionarPaginaSeleccion(p: Pagina) {
    if (this.thumbSeleccionados.length === 0) this.inicioSeleccion = p;
    if (!this.thumbSeleccionados.find((x) => x.Id === p.Id)) {
      this.thumbSeleccionados.push(p);
      this.subjectPaginasSeleccionadas.next(this.thumbSeleccionados);
    }
  }

  public EliminarSeleccion() {
    this.thumbSeleccionados = [];
    this.inicioSeleccion = null;
    this.finSeleccion = null;
    this.subjectPaginasSeleccionadas.next(this.thumbSeleccionados);
  }

  /// -----------------------------------------------------
  ObtienePaginasSeleccionadas(): Observable<Pagina[]> {
    return this.subjectPaginasSeleccionadas.asObservable();
  }

  ObtienePaginaVisible(): Observable<Pagina> {
    return this.subjectPaginaVisible.asObservable();
  }

  // --------------------------------------------------------------
  // --------------------------------------------------------------
}
