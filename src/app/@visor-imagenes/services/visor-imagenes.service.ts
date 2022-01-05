import { HighlightHit } from './../../@busqueda-contenido/model/highlight-hit';
import { AppConfig } from './../../app-config';
import { first } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, AsyncSubject, BehaviorSubject, Subject } from 'rxjs';
import { Documento } from '../model/documento';
import { DocumentosService } from './documentos.service';
import { Pagina, OperacionHeader } from '../model/pagina';
import { IUploadConfig } from '../model/i-upload-config';
import { PermisoPuntoMontaje } from '../../@pika/pika-module';

@Injectable()
export class VisorImagenesService {
  private subjectPaginasSeleccionadas = new BehaviorSubject<Pagina[]>([]);
  private subjectPaginaVisible = new BehaviorSubject<Pagina>(null);
  private subjectOperacionHeader = new BehaviorSubject<OperacionHeader>(null);
  private subjectFiltroPaginas = new BehaviorSubject<boolean>(null);
  private subjLeyendoPaginas = new BehaviorSubject<boolean>(false);
  private subjectCambiarPagina = new BehaviorSubject<{anterior: boolean, siguiente: boolean, indice: number}>(null);

  private subjecActualizarPaginas = new BehaviorSubject<Pagina[]>(null);
  private subjectOpenUpload = new BehaviorSubject<boolean>(false);
  private subjectPermisos = new BehaviorSubject<PermisoPuntoMontaje>({ Id: '',
    PuntoMontajeId: '',
    DestinatarioId: '',
    Leer: false,
    Crear: false,
    Actualizar: false,
    Elminar: false,
    GestionContenido: false,
    GestionMetadatos: false });

  documento: Documento = null;
  config: IUploadConfig = null;
  permisosRepositorio: PermisoPuntoMontaje = null;
  thumbActivo: Pagina = null;
  thumbSeleccionados: Pagina[] = [];
  inicioSeleccion: Pagina = null;
  finSeleccion: Pagina = null;

  constructor(
    private app: AppConfig,
    private docService: DocumentosService) {
    }

  // Getsion de permisos
  // ---------------------------------------
  // ---------------------------------------
  ObtienePermisos(): Observable<PermisoPuntoMontaje> {
    return this.subjectPermisos.asObservable();
  }

  EmiteEventoPermisos(permisos: PermisoPuntoMontaje): void {
    this.permisosRepositorio = permisos;
    this.subjectPermisos.next(permisos);
  }


  EliminaPaginas(paginas: Pagina[]): Observable<boolean> {
    const subject = new AsyncSubject<boolean>();
    this.docService.EliminaPaginas(this.documento.Id, paginas).pipe(first())
    .subscribe(r => {
      subject.next(true);
      subject.complete();
    }, () => {
      subject.next(false);
      subject.complete();
    } );
    return subject;
  }

  private DepuraUrl(url: string): string {
    return url.replace(/\/$/, '') + '/';
  }

  ObtienePermisoPuntoMontaje(id: string): Observable<PermisoPuntoMontaje> {
    return this.docService.ObtienePermisoPuntoMontaje(id);
  }

  public ObtieneSinopsis(busqeudaId: string, elementoId: string): Observable<HighlightHit[]> {
      return this.docService.OntieneSinopsis(busqeudaId, elementoId);
  }

  public ObtieneDocumento(DocumentoId: string): Observable<Documento> {
    this.subjLeyendoPaginas.next(true);
    // Un AsyncSubject devuelve el último valor obtenido ccuando se completa (subject.complete)
    const subject = new AsyncSubject<Documento>();
    this.docService
      .ObtieneDocumento(DocumentoId)
      .pipe(first()) // pipe(first()) obtiene SOLO el primer elemento que devuelva un observable
      .subscribe(
        (documento) => {
          this.documento = documento;
          this.GeneraUrlPaginas();

          subject.next(this.documento); // con .next asigamos un nuevo valor a nuestro subject
          this.subjLeyendoPaginas.next(false);
        },
        (error) => {
          // En caso de que ocurra un error asignamos el valor null a nuestrp subject
          subject.next(null);
          this.subjLeyendoPaginas.next(false);
        },
        () => {
          // Una vez que se recie el primer valor u ocurre un error completamos el subjet
          // y así sus sucriptores reciber el último valor obtenido
          subject.complete();
        },
      );

    return subject;
  }

  // Genera las urls de las páginas del documento actual y el arreglo de páginas para leerlo después de SUBIR nuevas
  public GeneraUrlPaginas(): Pagina[] {
    for (let i = 0; i < this.documento.Paginas.length; i++ ) {
      let url = `${this.config.VolumenId}/`;
      url = url + `${this.config.ElementoId}/`;
      url = url + `${this.config.VersionId}/`;
      url = url + `${this.documento.Paginas[i].Id}/`;
      url = url + `${this.documento.Paginas[i].Extension}`;

      this.documento.Paginas[i].Url = `${this.DepuraUrl(this.app.config.mediaUrl)}pagina/` + url;
      if ( this.documento.Paginas[i].TieneMiniatura ) {
        this.documento.Paginas[i].UrlThumbnail = `${this.DepuraUrl(this.app.config.mediaUrl)}mini/` + url;
      } else {
        let tipoImg = null;
        if (this.documento.Paginas[i].EsPDF) tipoImg = 'pdf.png';
        if (this.documento.Paginas[i].EsAudio) tipoImg = 'audio.png';
        if (this.documento.Paginas[i].EsVideo) tipoImg = 'video.png';
        if (this.documento.Paginas[i].Url.includes('.doc')) tipoImg = 'doc.png';
        if (this.documento.Paginas[i].Url.includes('.xls')) tipoImg = 'xls.png';
        if (this.documento.Paginas[i].Url.includes('.ppt')) tipoImg = 'ppt.png';

        tipoImg = tipoImg ? tipoImg : 'file.png';
        // tipoImg = 'file.png';
        this.documento.Paginas[i].UrlThumbnail =  '/assets/images/' + tipoImg;
      }
    }
    this.documento.Paginas.sort((a, b) => a.Indice - b.Indice);
    return this.documento.Paginas;
  }


  //#region Actualiza páginas después de subida de archivos
  // --------------------------------------------------------------

  public EstableceAbrirUpload(actualizar: boolean) {
    this.subjectOpenUpload.next(actualizar);
  }

  public ObtieneAbrirUpload(): Observable<boolean> {
    return this.subjectOpenUpload.asObservable();
  }

  public EstableceActualizarPaginas(paginas: Pagina[], ElementoId: string) {
    paginas.forEach( p => p.ElementoId = ElementoId);
    this.subjecActualizarPaginas.next(paginas);
  }

  public ObtieneActualizarPags(): Observable<Pagina[]> {
    return this.subjecActualizarPaginas.asObservable();
  }

  public SetLeyendoPaginas(leyendo: boolean) {
    this.subjLeyendoPaginas.next(leyendo);
  }

  public LeyendoPaginas(): Observable<boolean> {
    return this.subjLeyendoPaginas;
  }

  //#endregion
  // --------------------------------------------------------------

  //#region Administración de páginas seleccionadas
  // --------------------------------------------------------------
  public EstablecerPaginaActiva(p: Pagina) {
    this.thumbActivo = p;
    this.subjectPaginaVisible.next(this.thumbActivo);
  }

  public EstableceOperacionHeader(opHeader: OperacionHeader) {
    this.subjectOperacionHeader.next(opHeader);
  }

  public SeleccionShift(p: Pagina) {
    if (!this.inicioSeleccion) this.inicioSeleccion = this.documento.Paginas[0];
    this.finSeleccion = p;
    this.thumbSeleccionados = this.documento.Paginas.filter( x =>
        x.Indice >= this.inicioSeleccion.Indice && x.Indice <= this.finSeleccion.Indice ||
        x.Indice <= this.inicioSeleccion.Indice && x.Indice >= this.finSeleccion.Indice);

      this.subjectPaginasSeleccionadas.next(this.thumbSeleccionados);
  }

  public AdicionarPaginaSeleccion(p: Pagina) {
    if (this.thumbSeleccionados.length === 0) this.inicioSeleccion = p;
    if (!this.thumbSeleccionados.find((x) => x.Id === p.Id)) {
      this.thumbSeleccionados.push(p);
      this.subjectPaginasSeleccionadas.next(this.thumbSeleccionados);
    }
  }

  public EliminarPaginaSeleccion(p: Pagina) {
    if (this.thumbSeleccionados.find( x => x.Id === p.Id)) {
      this.thumbSeleccionados.splice(this.thumbSeleccionados.findIndex(x => x.Id === p.Id), 1);
      this.subjectPaginasSeleccionadas.next(this.thumbSeleccionados);
      // ELIMINAR VISOR SI ESTA SELECCIONADA NO IMG
    }
  }

  public EliminarSeleccion() {
    this.thumbSeleccionados = [];
    this.inicioSeleccion = null;
    this.finSeleccion = null;
    this.subjectPaginasSeleccionadas.next(this.thumbSeleccionados);
  }

  public SiguientePaginaVisible(pagina: Pagina, siguiente: boolean) {
    this.subjectCambiarPagina.next({anterior: false, siguiente: siguiente, indice: pagina.Indice});
  }

  public AnteriorPaginaVisible(pagina: Pagina, anterior: boolean) {
    this.subjectCambiarPagina.next({anterior: anterior, siguiente: false, indice: pagina.Indice});
  }

  public ObtieneCambiarPagina(): Observable<{anterior: boolean, siguiente: boolean, indice: number}> {
    return this.subjectCambiarPagina.asObservable();
  }

  /// -----------------------------------------------------

  ObtienePaginasSeleccionadas(): Observable<Pagina[]> {
    return this.subjectPaginasSeleccionadas.asObservable();
  }

  ObtienePaginaVisible(): Observable<Pagina> {
    return this.subjectPaginaVisible.asObservable();
  }

  ObtieneOperacionHeader(): Observable<OperacionHeader> {
    return this.subjectOperacionHeader.asObservable();
  }

  //#endregion
  // --------------------------------------------------------------

  //#region Filtro Solo imágenes
  // --------------------------------------------------------------

  public EstableceFiltroPaginas(soloImagenes: boolean ) {
    this.subjectFiltroPaginas.next(soloImagenes);
  }

  public ObtieneFiltroPaginas(): Observable<Object> {
    return this.subjectFiltroPaginas.asObservable();
  }



  // //#endregion
  // --------------------------------------------------------------
}
