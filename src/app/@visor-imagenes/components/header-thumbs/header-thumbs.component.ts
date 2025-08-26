import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  Input,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import { pipe, Subject } from "rxjs";
import { first, takeUntil } from "rxjs/operators";
import { Traductor } from "../../../@editor-entidades/editor-entidades.module";
import { AppLogService } from "../../../services/app-log/app-log.service";
import { NumeroABytes } from "../../model/comunes";
import { MODO_VISTA_DETALLES, MODO_VISTA_MINIATURAS } from "../../model/constantes";
import { Documento } from "../../model/documento";
import { OperacionHeader, Pagina } from "../../model/pagina";
import { DocumentosService } from "../../services/documentos.service";
import { VisorImagenesService } from "../../services/visor-imagenes.service";
import { ConfirmacionVisorComponent } from "../confirmacion-visor/confirmacion-visor.component";
import { PdfDownloadComponent } from "../pdf-download/pdf-download.component";
import { UploadService } from "../../services/uploader.service";
import { IUploadConfig } from "../../visor-imagenes.module";

enum operacionesPaginas {
  ninguna,
  mover
}
@Component({
  selector: "ngx-header-thumbs",
  templateUrl: "./header-thumbs.component.html",
  styleUrls: ["./header-thumbs.component.scss"],
})
export class HeaderThumbsComponent implements OnInit, OnDestroy, OnChanges {
  @Output() paginasEliminadas = new EventEmitter();
  @Output() callUpload = new EventEmitter();
  @Output() cerrarDocumento = new EventEmitter();
  @Output() cerrarVista = new EventEmitter();
  @Output() modoVista = new EventEmitter();
  @Output() eventMuestraInfo = new EventEmitter();
  @Output() irAPagina = new EventEmitter();
  @Output() rotarDerecha = new EventEmitter();
  @Output() rotarIzquierda = new EventEmitter();
  @Output() rotar180 = new EventEmitter();
  @Output() flipHorizontal = new EventEmitter();
  @Output() rotarVertical = new EventEmitter();
  @Input() documento: Documento;
  @Input() config: IUploadConfig;



  // Bandera para indicar que hay una operación de confirmación pendiente
  confirmacionPendiente: boolean = false;
  operacionPagina: operacionesPaginas = operacionesPaginas.ninguna;
  textoPaginasConfirmacion: string = "";
  paginasOperacion: Pagina[] = [];

  totalPaginas: string = "";
  tamanoPaginas: string = "";
  paginaidx: string = '';
  esImagen: boolean = false;
  verMiniaturas: boolean = true;
  verDetalle: boolean = false;
  crear: boolean = false;
  leer: boolean = false;
  eliminar: boolean = false;
  soloImagenes: boolean = false;
  estadoMuestraInfo: boolean = false;
  operaciones = OperacionHeader;
  private paginas: Pagina[];
  private pagina: Pagina;
  public T: Traductor;

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(
    private servicioVisor: VisorImagenesService,
    private docService: DocumentosService,
    private uploadService: UploadService,
    ts: TranslateService,
    private dialogService: NbDialogService,
    public applog: AppLogService
  ) {
    this.T = new Traductor(ts);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.documento){
      let s = 0;
      this.totalPaginas = `${this.documento.Paginas.length}`;
      this.documento.Paginas.forEach(p=> {
        s += p.TamanoBytes;
      });
      this.tamanoPaginas = NumeroABytes(s);
    }
  }

  ngOnInit(): void {
    this.CargaTraducciones();
    this.servicioVisor
      .ObtienePermisos()
      .pipe(first())
      .subscribe((p) => {
        this.crear = p.Crear;
        this.leer = p.Leer;
        this.eliminar = p.GestionContenido;
      });

      this.servicioVisor.ObtienePaginaVisible()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((p) => {
        if(p) {
          this.paginaidx = `${p.Indice}`;
          this.pagina = p;
          this.esImagen = p.EsImagen;
        }
      });

    this.servicioVisor.ObtienePaginasSeleccionadas()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((p) => {
      this.paginas = p;
    });
    console.log('Imprimiendo configuracion');
    console.log(this.config);
  }

  private CargaTraducciones() {
    this.T.ts = [
      'ui.cerrarvista','ui.cancelar','ui.aceptar',
      'ui.cerrardocumento',
      'ui.subirarchivos',
      'ui.descargararchivos',
      'ui.lanzarcliente',
      'ui.descargarpdf',
      'ui.todos-docs',
      'ui.solo-img',
      'ui.eliminar-contenido',
      'visor.eliminar-cotenido-titulo',
      'visor.eliminar-cotenido-mensaje',
      'ui.vista-miniaturas',
      'ui.vista-detalle',
      'ui.reordernar-nombre',
      'componentes.visor-documento.titulo-pdf-ack','ui.sel-invertir','ui.sel-todos','ui.sel-eliminar',
      'visor.reordenar-por-nombre','visor.reordenar-por-nombre-titulo','visor.reordenar-por-nombre-ok',
      'visor.reordenar-por-nombre-error',
      'visor.mover-paginas-titulo','visor.mover-paginas-msg', 'visor.mover-paginas', 'visor.mover-paginas-ok',
      'visor.mover-paginas-error', 'visor.mover-paginas-solo-una',
      'visor.al-inicio','visor.al-final','visor.a-pagina','visor.rotar-izquierda','visor.rotar-derecha',
      'visor.rotar-180','visor.reflejar-vertical','visor.reflejar-horizontal',
      'visor.al-inicio','visor.al-final','visor.a-pagina'
    ];
    this.T.ObtenerTraducciones();
  }

  IrALaPaginaInicio() {
    if(this.documento && this.documento.Paginas.length > 0 ){
      this.EstablecePaginaActiva(1)
    }
  }

  IrALaPagina() {
    if(this.documento && this.documento.Paginas.length > 0  && this.paginaidx){
      this.EstablecePaginaActiva(parseInt(this.paginaidx))
    }
  }

  IrALaPaginaFinal() {
    if(this.documento && this.documento.Paginas.length > 0 ){
      this.EstablecePaginaActiva(this.documento.Paginas.length)
    }
  }

  EstablecePaginaActiva(index: number) {
    this.irAPagina.emit(index);
    this.paginaidx = `${index}`;
  }

  cambiaPaginaidx(idx: string) {
    const i = parseInt(idx);
    this.paginaidx = `${i}`;

    if( i < 1) {
        this.paginaidx = '1';
    }

    if( i > this.documento.Paginas.length) {
      this.paginaidx = `${this.documento.Paginas.length}`;
    }
  }

  Confirmar(ok: boolean){
    if(ok) {
      switch(this.operacionPagina) {
        case operacionesPaginas.mover:
          this.moverPaginas();
          break;
      }
    } else {
      this.estadoConfirmacion();
    }
  }

  estadoConfirmacion(mostrar: boolean = false, tipo: operacionesPaginas = null, texto: string = '') {
    this.operacionPagina = tipo;
    this.confirmacionPendiente = mostrar;
    this.textoPaginasConfirmacion = texto;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  EstableceSoloImaganes(soloImagenes: boolean) {
    this.soloImagenes = soloImagenes;
    this.servicioVisor.EstableceFiltroPaginas(soloImagenes);
  }

  muestraInfo() {
    this.estadoMuestraInfo = !this.estadoMuestraInfo;
    this.eventMuestraInfo.emit();
  }

  doUpload() {
    this.callUpload.emit();
  }

  doZipDownload() {
    this.docService.ObtieneZIP(this.documento.Id, this.documento.VersionId);
  }

  doPDFDownload() {

      this.dialogService
      .open(PdfDownloadComponent, {
        context: {
          titulo: this.T.t['componentes.visor-documento.titulo-pdf-ack']
        },
      })
      .onClose.subscribe((confirmacion) => {
        if (confirmacion.confirma) {
          this.docService.ObtienePDF(this.documento.Id, this.documento.VersionId, confirmacion.porciento);
        }
      });
  }

  CerrarDocumento() {
    this.cerrarDocumento.emit(this.documento);
  }

  CerraVista() {
    this.cerrarVista.emit();
  }

  seModoVista(modo: string) {
    if(modo === MODO_VISTA_MINIATURAS) {
      this.verMiniaturas = true;
      this.verDetalle = false;
    }

    if(modo === MODO_VISTA_DETALLES) {
      this.verMiniaturas = false;
      this.verDetalle = true;
    }

    this.modoVista.emit(modo);
  }

  selInvertir() {
    if(this.documento.Paginas.length > 0){
      this.servicioVisor.InvertirSeleccion();
    }
  }

  selTodos() {
    if(this.documento.Paginas.length > 0){
      this.servicioVisor.SelecionarTodos();
    }
  }

  selEliminar() {
    this.servicioVisor.EliminarSeleccion();
  }

reordenarPorNombre() {
  this.dialogService
  .open(ConfirmacionVisorComponent, {
    context: {
      titulo: this.T.t['visor.reordenar-por-nombre-titulo'],
      texto: this.T.t['visor.reordenar-por-nombre'],
    },
  })
  .onClose.subscribe((confirmacion) => {
    if (confirmacion) {
      this.servicioVisor.ReordenarPorNombre(this.documento.Id).pipe(first())
      .subscribe(ok => {
        this.applog.ExitoT('visor.reordenar-por-nombre-ok');
        const paginasEliminadas = [];
        this.paginasEliminadas.emit(paginasEliminadas)

      }, (err)=> { this.applog.ExitoT('visor.reordenar-por-nombre-error'); console.error(err)});
    }
  });
}


iniciarMover() {
  if (this.paginas.length > 0) {
    this.applog.ExitoT(
      'visor.mover-paginas-msg',
      null,
      null,
    );
    this.estadoConfirmacion(true, operacionesPaginas.mover, this.T.t["visor.mover-paginas"]);
    this.paginasOperacion = JSON.parse(JSON.stringify(this.paginas));
  } else {
    this.applog.AdvertenciaT(
      'visor.warn-sin-seleccion',
      null,
      null,
    );
  }
}

moverPaginas() {
  if(this.paginas.length == 1) {
    const target: number = this.paginas[0].Indice;
    const paginas: number[]  = [];
    this.paginasOperacion.forEach(p=> {
      paginas.push(p.Indice);
    })

    this.servicioVisor.MoverPaginas(this.documento.Id, target, paginas).pipe(first())
        .subscribe(ok => {
          this.applog.AdvertenciaT(
            'visor.mover-paginas-ok',
            null,
            null,
          );
          this.estadoConfirmacion();
          this.paginasEliminadas.emit([]);
        }, (err)=> {          this.applog.AdvertenciaT(
          'visor.mover-paginas-error',
          null,
          null,
        );} );
  } else {
    this.applog.AdvertenciaT(
      'visor.mover-paginas-solo-una',
      null,
      null,
    );
  }

}

  doEliminar() {
    if (this.paginas.length > 0) {
      this.dialogService
      .open(ConfirmacionVisorComponent, {
        context: {
          titulo: this.T.t['visor.eliminar-cotenido-titulo'],
          texto: this.T.t['visor.eliminar-cotenido-mensaje'],
        },
      })
      .onClose.subscribe((confirmacion) => {
        if (confirmacion) {
          this.servicioVisor.EliminaPaginas(this.paginas).pipe(first())
          .subscribe(ok => {
            const paginasEliminadas = [];
            this.paginas.forEach(p=> {
              paginasEliminadas.push({...p});
            })
            this.paginasEliminadas.emit(paginasEliminadas)
          });
        }
      });
    } else {
      this.applog.AdvertenciaT(
        'visor.warn-sin-seleccion',
        null,
        null,
      );
    }
  }

  doScanner(){
    const newWindow = window.open('', '_blank');
    this.uploadService.CreaTokenScanner(this.config.ElementoId, this.config.VersionId)
    .subscribe({
      next: (e) => {
        if (e && e.Token) {
          e.Caducidad = new Date(e.Caducidad);
          const datos = new URLSearchParams({
            token: e.Token,
            elementoId: e.ElementoId,
            versionId: e.VersionId,
            volumenId: this.config.VolumenId,
            puntoMontajeId: this.config.PuntoMontajeId,
            caducidad: e.Caducidad.toISOString()
          });
          const scannerUrl = `pikascan://?token=${datos.toString()}`;
          newWindow.location.href = scannerUrl;
        } else {
          newWindow.close();
          console.error('No se recibió token');
        }
      },
      error: (err) => {
        newWindow.close();
        console.error('Error al generar token:', err);
      }
    });
  }


  EstableceOperacionPagina(operacion: OperacionHeader) {

    if(this.paginas.length==0){
      this.applog.AdvertenciaT(
        'visor.warn-sin-seleccion',
        null,
        null,
      );
      return;
    }

    const ids: string[] = this.paginas.map(function(x) {
      return x.Id;
    });

    var giro:boolean = false;
    var reflejo:boolean = false;
    var param:string = '';
    switch (operacion) {
      case OperacionHeader.GIRAR_180:
        giro = true;
        param = '180';
        break;

        case OperacionHeader.GIRAR_DER:
        giro = true;
        param = '90';
        break;

      case OperacionHeader.GIRAR_IZQ:
        giro = true;
        param = '270';
        break;

      case OperacionHeader.REFLEJO_HOR:
        reflejo = true;
        param = 'H';
        break;

      case OperacionHeader.REFLEJO_VER:
        reflejo = true;
        param = 'V';
        break;
    }

    if(giro) {
      this.servicioVisor.RotarPaginas(this.documento.Id, ids, parseInt(param))
      .pipe(first()).subscribe(ok=> {
        this.servicioVisor.EstableceOperacionHeader(operacion);
      }, (err)=> { });
    }

    if(reflejo) {
      this.servicioVisor.ReflejarPaginas(this.documento.Id, ids, param)
      .pipe(first()).subscribe(ok=> {
        this.servicioVisor.EstableceOperacionHeader(operacion);
      }, (err)=> { });
    }

  }

}
