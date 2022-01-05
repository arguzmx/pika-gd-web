import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  Input,
  EventEmitter,
} from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import { pipe, Subject } from "rxjs";
import { first, takeUntil } from "rxjs/operators";
import { Traductor } from "../../../@editor-entidades/editor-entidades.module";
import { AppLogService } from "../../../@pika/servicios";
import { Documento } from "../../model/documento";
import { Pagina } from "../../model/pagina";
import { DocumentosService } from "../../services/documentos.service";
import { VisorImagenesService } from "../../services/visor-imagenes.service";
import { ConfirmacionVisorComponent } from "../confirmacion-visor/confirmacion-visor.component";

@Component({
  selector: "ngx-header-thumbs",
  templateUrl: "./header-thumbs.component.html",
  styleUrls: ["./header-thumbs.component.scss"],
})
export class HeaderThumbsComponent implements OnInit, OnDestroy {
  @Output() paginasEliminadas = new EventEmitter();
  @Output() callUpload = new EventEmitter();
  @Output() cerrarDocumento = new EventEmitter();
  @Output() cerrarVista = new EventEmitter();
  @Output() eventMuestraInfo = new EventEmitter();
  @Input() documento: Documento;

  crear: boolean = false;
  leer: boolean = false;
  eliminar: boolean = false;
  soloImagenes: boolean = false;
  estadoMuestraInfo: boolean = false;
  private paginas: Pagina[];
  public T: Traductor;

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(
    private servicioVisor: VisorImagenesService,
    private docService: DocumentosService,
    ts: TranslateService,
    private dialogService: NbDialogService,
    public applog: AppLogService
  ) {
    this.T = new Traductor(ts);
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

    this.servicioVisor.ObtienePaginasSeleccionadas()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((p) => {
      this.paginas = p;
    });
  }

  private CargaTraducciones() {
    this.T.ts = [
      "ui.cerrarvista",
      "ui.cerrardocumento",
      "ui.subirarchivos",
      "ui.descargararchivos",
      "ui.descargarpdf",
      "ui.todos-docs",
      "ui.solo-img",
      "ui.eliminar-contenido",
      "visor.eliminar-cotenido-titulo",
      "visor.eliminar-cotenido-mensaje",
    ];
    this.T.ObtenerTraducciones();
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
    this.docService.ObtienePDF(this.documento.Id, this.documento.VersionId);
  }

  CerrarDocumento() {
    this.cerrarDocumento.emit(this.documento);
  }

  CerraVista() {
    this.cerrarVista.emit();
  }

  doEliminar() {
    if (this.paginas.length > 0) {
      this.dialogService
      .open(ConfirmacionVisorComponent, {
        context: {
          titulo: this.T.t["visor.eliminar-cotenido-titulo"],
          texto: this.T.t["visor.eliminar-cotenido-mensaje"],
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
}
