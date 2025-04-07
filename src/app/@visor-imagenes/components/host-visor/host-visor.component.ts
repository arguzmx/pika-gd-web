import { HighlightHit } from "./../../../@busqueda-contenido/model/highlight-hit";
import { Documento } from "./../../model/documento";
import { DocumentosService } from "./../../services/documentos.service";
import { VisorImagenesService } from "./../../services/visor-imagenes.service";
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { Subject } from "rxjs";
import { first, take, takeUntil } from "rxjs/operators";
import { Pagina } from "../../model/pagina";
import { UploadService } from "../../services/uploader.service";
import { CacheEntidadesService } from "../../../@editor-entidades/editor-entidades.module";
import { UploaderComponent } from "../uploader/uploader.component";
import { IUploadConfig } from "../../model/i-upload-config";
import { HostThumbnailsComponent } from "../host-thumbnails/host-thumbnails.component";
import { MODO_VISTA_MINIATURAS } from "../../model/constantes";
import { InfoService } from "../../services/info.service";

@Component({
  selector: "ngx-host-visor",
  templateUrl: "./host-visor.component.html",
  styleUrls: ["./host-visor.component.scss"],
  providers: [
    DocumentosService,
    CacheEntidadesService,
    VisorImagenesService,
    UploadService,
    DocumentosService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostVisorComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  private onDestroy$: Subject<void> = new Subject<void>();
  public documento: Documento;
  private paginas: Pagina[] = [];
  public Titulo: string = "";
  public alturaComponente = "500px";
  public alturaPanelThumbs = "400px";
  public VistaTrasera: boolean;
  public EsImagen: boolean = true;
  public MostrarResultadosTexto: boolean = false;
  public highlightHit: HighlightHit;
  public Miniaturas: boolean = false;
  modoVista: string = MODO_VISTA_MINIATURAS;
  verificandoPermisos: boolean = true;
  accesoPermitido: boolean = false;
  cierraCarga: boolean;

  @ViewChild("thumbnails", { static: false })
  thumbnails: HostThumbnailsComponent;

  @Output() cerrarDocumento = new EventEmitter();
  @Output() cerrarVista = new EventEmitter();
  @Input() config: IUploadConfig;
  @ViewChild("uploader") uploader: UploaderComponent;

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.setAlturaPanel(event.target.innerHeight);
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private servicioVisor: VisorImagenesService,
    private uploadService: UploadService,
    private infoService: InfoService
  ) {
    this.infoService.data.subscribe(val => {
      this.cierraCarga = val;
      if (this.cierraCarga) {
        this.CargaDocumento();
      }
      cdr.detectChanges();
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case "config":
            this.procesaConfiguracion();
            break;
        }
      }
    }
  }

  private procesaConfiguracion() {
    this.servicioVisor
      .ObtienePermisoPuntoMontaje(this.config.PuntoMontajeId)
      .pipe(first())
      .subscribe(
        (p) => {
          this.Titulo = this.config.Nombre;
          this.servicioVisor.config = this.config;
          this.uploadService.SetConfig(this.config);
          this.configuraBusquedaTexto();
          this.verificandoPermisos = false;
          this.accesoPermitido = p.Leer || p.Crear;
          this.servicioVisor.permisosRepositorio = p;
          this.servicioVisor.EmiteEventoPermisos(p);
          this.cdr.detectChanges();
        },
        (e) => {
          console.error(e);
          this.verificandoPermisos = false;
          this.cdr.detectChanges();
        }
      );
  }

  private configuraBusquedaTexto() {
    const parametro = this.config.parametros.find((x) => x.id == "texto");
    if (parametro && parametro.valor == "1") {
      this.servicioVisor
        .ObtieneSinopsis(
          this.config.parametros.find((x) => x.id == "searchid").valor,
          this.config.ElementoId
        )
        .pipe(first())
        .subscribe((s) => {
          if (s) {
            this.MostrarResultadosTexto = true;
            this.highlightHit = s[0];
            this.Miniaturas = false;
          }
        });
    }
  }

  ngOnInit(): void {
    this.infoService.data.subscribe(res => this.cierraCarga = res);
    this.VistaTrasera = false;
    this.setAlturaPanel(window.innerHeight);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  ngAfterViewInit(): void {
    this.CargaDocumento();
    this.EscuchaCambiosPagina();
    this.EscuchaFiltroPaginas();
    this.EscuchaCambiarPaginaVisible();
    this.EscuchaActualizarPaginas();
  }

  public CargaDocumento() {
    this.servicioVisor
      .ObtieneDocumento(this.config.ElementoId)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((doc) => {
        this.documento = doc;
        this.paginas = this.documento.Paginas;
        this.cdr.detectChanges();
      });
  }

  EscuchaFiltroPaginas() {
    this.servicioVisor
      .ObtieneFiltroPaginas()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((soloImagenes) => {
        if (this.documento)
          this.documento.Paginas = soloImagenes
            ? this.paginas.filter((x) => x.EsImagen)
            : this.paginas;
      });
  }

  private EscuchaCambiosPagina() {
    this.servicioVisor
      .ObtienePaginaVisible()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((p) => {
        if (p) {
          this.EsImagen = p.EsImagen;
        }
      });
  }

  EscuchaCambiarPaginaVisible() {
    this.servicioVisor
      .ObtieneCambiarPagina()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((control) => {
        if (this.documento && control) {
          let pagina: Pagina = null;
          const index = this.documento.Paginas.findIndex(
            (x) => x.Indice === control.indice
          );

          if (control.siguiente) {
            pagina = this.documento.Paginas[index + 1];
            if (pagina)
              this.servicioVisor.SiguientePaginaVisible(pagina, false);
          }
          if (control.anterior) {
            pagina = this.documento.Paginas[index - 1];
            if (pagina) this.servicioVisor.AnteriorPaginaVisible(pagina, false);
          }

          if (pagina) {
            this.servicioVisor.EliminarSeleccion();
            this.servicioVisor.EstablecerPaginaActiva(pagina);
            this.servicioVisor.AdicionarPaginaSeleccion(pagina);
          }
        }
      });
  }

  EscuchaActualizarPaginas() {
    this.servicioVisor
      .ObtieneActualizarPags()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((paginasNuevas) => {
        if (this.documento) {
          if (this.documento.Id == paginasNuevas[0].ElementoId) {
            this.documento.Paginas = this.servicioVisor.GeneraUrlPaginas();
          }
        }
      });
  }

  private setAlturaPanel(altura: number) {
    let h = parseInt(altura.toString(), 0) - 300;
    h = h < 0 ? 200 : h;
    const a = `${h}px`;
    const b = `${h - 50}px`;
    this.alturaComponente = a;
    this.alturaPanelThumbs = b;
  }

  public NuevaSeleccion(event) {
    this.thumbnails.SetPage(event["ParteId"]);
  }

  public irAPagina(event) {
    this.thumbnails.gotoPage(event);
  }

  // Envia el  input para mostrar el tarahet trasera del panel del visor
  public eventMuestraInfo() {
    this.VistaTrasera = !this.VistaTrasera;
  }

  public callUpload() {
    this.servicioVisor.EstableceAbrirUpload(true);
  }

  evCerrarDocumento($event: Documento) {
    this.cerrarDocumento.emit($event);
  }

  evCerrarVista() {
    this.cerrarVista.emit();
  }

  paginasEliminadas(paginas: Pagina[]) {
    // const copia = [...this.documento.Paginas];
    // paginas.forEach(p=> {
    //     const index = this.documento.Paginas.findIndex(x=>x.Id == p.Id);
    //     if (index >= 0) {
    //       copia.splice(index, 1);
    //     }
    // });
    // this.documento.Paginas = copia;
    // this.cdr.detectChanges();
    this.CargaDocumento();
  }


  @HostListener("window:keydown", ["$event"])
  CancelaFuncionReAvPag($event) {
    if ($event.key === "PageUp" || $event.key === "PageDown") {
      $event.preventDefault();
    }
  }

  evModoVista(modo: string) {
    this.modoVista = modo;
  }

  @HostListener("window:keyup", ["$event"])
  CambiaPaginaVisible($event) {
    $event.stopPropagation();
    if ($event.key === "PageUp" || $event.key === "PageDown") {
      let paginaActual = null;
      this.servicioVisor
        .ObtienePaginaVisible()
        .pipe(take(1))
        .subscribe((pagina) => {
          if (pagina) paginaActual = pagina;
        });

      switch ($event.key) {
        case "PageDown":
          this.servicioVisor.SiguientePaginaVisible(paginaActual, true);
          break;
        case "PageUp":
          this.servicioVisor.AnteriorPaginaVisible(paginaActual, true);
          break;
      }
    }
  }
}
