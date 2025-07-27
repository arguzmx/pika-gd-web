import { OfflineMetadataVisorComponent } from './../../../@editor-entidades/components/offline-metadata-visor/offline-metadata-visor.component';
import { MetadataInfo } from './../../../@pika/metadata/metadata-info';
import { DialogMetadataComponent } from './../dialog-metadata/dialog-metadata.component';
import { first } from 'rxjs/operators';
import { Component, OnInit, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges, 
  ViewContainerRef, ComponentFactoryResolver, ComponentRef, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NbDialogRef, NbDialogService, NbSelectComponent } from '@nebular/theme';
import { DocumentosService } from '../../services/documentos.service';
import { DocumentoPlantilla, RequestValoresPlantilla, VinculoDocumentoPlantilla, VinculosObjetoPlantilla } from '../../../@pika/pika-module';
import { IUploadConfig } from '../../model/i-upload-config';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { TranslateService } from '@ngx-translate/core';
import { AppLogService } from '../../../services/app-log/app-log.service';
import { isValid, parseISO } from 'date-fns';

@Component({
  selector: "ngx-editor-plantilla",
  templateUrl: "./editor-plantilla.component.html",
  styleUrls: ["./editor-plantilla.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorPlantillaComponent
  implements OnInit, AfterViewInit, OnChanges
{
  private TipoObjetoMetadatos: string = "PIKA.Modelo.Contenido.Elemento";
  public plantillas: unknown[] = [];
  public metadatos: MetadataInfo[] = [];
  public editorVisible: boolean = false;
  public documentosMetadatos: DocumentoPlantilla[] = [];
  public vinculos: VinculosObjetoPlantilla;
  public sinMetadatos: boolean;
  private cantidadDocumentosUnicos: number;
  private cantidadMetadatosDocumentosUnicos: number;
  private idSeleccionado: string;
  private dialogoAbierto: NbDialogRef<unknown>;
  public T: Traductor;
  crear: boolean = false;
  leer: boolean = false;

  @ViewChild("dialogConfirmaEliminarUnico", { static: true })
  dialogEliminarUnico: TemplateRef<any>;

  @ViewChild("listaplantilla") listaplantilla: NbSelectComponent;
  @ViewChild("metadatosUnicos", { read: ViewContainerRef }) metadatosUnicos;
  @Input() config: IUploadConfig;

  constructor(
    ts: TranslateService,
    private cdr: ChangeDetectorRef,
    private servicioVisor: VisorImagenesService,
    private resolver: ComponentFactoryResolver,
    private servicioPlantilla: DocumentosService,
    private applog: AppLogService,
    private dialogService: NbDialogService
  ) {
    this.T = new Traductor(ts);
  }

  // Realiza el despliegue de metadatos
  private DeespliegaMetadatosUnicos(): void {
    this.metadatosUnicos.clear();
    const componentFactory = this.resolver.resolveComponentFactory(
      OfflineMetadataVisorComponent
    );
    const containerRef = this.metadatosUnicos;
    this.vinculos.Documentos.forEach((v) => {
      // Algunos links purden estar rotos y no hay datos
      if (this.documentosMetadatos.find((d) => d.Id === v.DocumentoId)) {
        this.sinMetadatos = false;
        const component: ComponentRef<OfflineMetadataVisorComponent> =
          containerRef.createComponent(componentFactory);
        component.instance.metadatos = this.metadatos.find(
          (m) => m.Tipo === v.PlantillaId
        );
        component.instance.valores = this.documentosMetadatos.find(
          (d) => d.Id === v.DocumentoId
        ).Valores;
        component.instance.etiqueta =
          v.Nombre !== ""
            ? v.Nombre
            : this.metadatos.find((m) => m.Tipo === v.PlantillaId).FullName;
        component.instance.registroId = v.DocumentoId;
        component.instance.EventoEditar.subscribe((id) => {
          this.EditarUnico(id);
        });
        component.instance.EventoEliminar.subscribe((id) => {
          this.ConfirmarEliminarUnico(id);
        });
      }
    });
    this.cdr.detectChanges();
  }

  private EditarUnico(id: string): void {
    const doc = this.documentosMetadatos.find((d) => d.Id === id);
    this.EditorPlantillaUnico(doc);
  }

  private ConfirmarEliminarUnico(id: string): void {
    this.idSeleccionado = id;
    this.dialogoAbierto = this.dialogService.open(this.dialogEliminarUnico, {
      context: id,
      closeOnBackdropClick: false,
    });
  }

  // Acceso vía template
  private EliminarUnico(): void {
    this.dialogoAbierto.close();
    const documento = this.vinculos.Documentos.find(
      (d) => d.DocumentoId == this.idSeleccionado
    );
    this.servicioPlantilla
      .EliminaDocumentoUnicoMetadatos(
        documento.PlantillaId,
        documento.DocumentoId
      )
      .subscribe(
        (id) => {
          const index = this.vinculos.Documentos.findIndex(
            (d) => d.DocumentoId == this.idSeleccionado
          );
          this.vinculos.Documentos.splice(index, 1);
          this.DeespliegaMetadatosUnicos();
          this.applog.Exito("", "Datos eliminados satisfactoriamente");
        },
        (e) => {
          console.error(e);
          this.applog.Falla("", "Los datos no pudieron ser eliminados");
        },
        () => {}
      );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ProcesaConfiguracion();
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.ObtienePlantillas();
    this.CargaTraducciones();
    this.servicioVisor
      .ObtienePermisos()
      .pipe(first())
      .subscribe((p) => {
        this.crear = p.GestionMetadatos;
        this.leer = p.Leer;
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
    ];
    this.T.ObtenerTraducciones();
  }

  private ProcesaConfiguracion(): void {
    if (this.config.ElementoId) {
      this.ObtieneVinculos(this.config.ElementoId);
    }
  }

  // Obtiene las plantillas disponibles para el documento
  private ObtienePlantillas(): void {
    this.sinMetadatos = true;
    this.servicioPlantilla
      .ObtienePlantillas()
      .pipe(first())
      .subscribe(
        (data) => {
          this.plantillas = data;
          this.cdr.detectChanges();
        },
        (e) => {},
        () => {}
      );
  }

  // Obtiene los vinculos a plantillas asociadas al documento
  private ObtieneVinculos(id: string): void {
    this.servicioPlantilla
      .ObtieneVinculosMetadatos(this.TipoObjetoMetadatos, id)
      .pipe(first())
      .subscribe(
        (vinculos) => {
          if (vinculos) {
            this.cantidadDocumentosUnicos = vinculos.Documentos.length;
            this.vinculos = vinculos;
            if (this.vinculos.Documentos.length > 0) {
              this.vinculos.Documentos.forEach((v) => {
                this.ObtieneDocumentoUnicoMetadatos(v);
              });
            }
          } else {
            this.vinculos = {
              _Id: "",
              Tipo: "",
              Id: "",
              Documentos: [],
              Listas: [],
            };
          }
        },
        (e) => {},
        () => {}
      );
  }

  // Obtiene los documentos de metadatos para cada vínculo
  private ObtieneDocumentoUnicoMetadatos(vinculo: VinculoDocumentoPlantilla) {
    this.servicioPlantilla
      .ObtieneDocumentoUnicoMetadatos(vinculo.PlantillaId, vinculo.DocumentoId)
      .pipe(first())
      .subscribe(
        (documento) => {
          this.documentosMetadatos.push(documento);
        },
        (e) => {
          this.cantidadDocumentosUnicos--;
          if (this.cantidadDocumentosUnicos === 0) {
            this.ObtieneMetadatosDocumentosUnicos();
          }
        },
        () => {
          this.cantidadDocumentosUnicos--;
          if (this.cantidadDocumentosUnicos === 0) {
            this.ObtieneMetadatosDocumentosUnicos();
          }
        }
      );
  }

  // Obtiene la defeinición de metadatos para cada tipo diferet
  private ObtieneMetadatosDocumentosUnicos(): void {
    const idmetadatos: string[] = [];
    this.vinculos.Documentos.forEach((v) => {
      if (idmetadatos.indexOf(v.PlantillaId) < 0) {
        idmetadatos.push(v.PlantillaId);
      }
    });

    if (idmetadatos.length > 0) {
      this.cantidadMetadatosDocumentosUnicos = idmetadatos.length;
      idmetadatos.forEach((id) => {
        this.servicioPlantilla.ObtieneMetadataInfo(id).subscribe(
          (m) => {
            this.metadatos.push(m);
          },
          (e) => {
            this.cantidadMetadatosDocumentosUnicos--;
            if (this.cantidadMetadatosDocumentosUnicos === 0) {
              this.DeespliegaMetadatosUnicos();
            }
          },
          () => {
            this.cantidadMetadatosDocumentosUnicos--;
            if (this.cantidadMetadatosDocumentosUnicos === 0) {
              this.DeespliegaMetadatosUnicos();
            }
          }
        );
      });
    }
  }

  // Inicializa la captura de un elemento único de metadatos
  public NuevoElementoUnico() {
    this.EditorPlantillaUnico(null);
  }

  public EditorPlantillaUnico(documento: DocumentoPlantilla): void {
    var idPlantilla: string = "";
    if (documento !== null) {
      idPlantilla = documento.PlantillaId;
    } else {
      idPlantilla = this.listaplantilla.selected;
    }

    if (idPlantilla) {
      this.dialogService
        .open(DialogMetadataComponent, {
          closeOnBackdropClick: false,
          closeOnEsc: false,
          hasScroll: true,
          context: { data: idPlantilla, documento: documento },
        })
        .onClose.subscribe((data) => {
          if (data !== null) {
            data.Valores.forEach((v) => {
              if (v.Valor.endsWith("Z") && isValid(parseISO(v.Valor))) {
                const d = new Date(v.Valor);
                v.Valor = this.getLocalISO(d);
              }
            });

            if (data.Id === "") {
              this.ProcesaCreacionMetadatos(data);
            } else {
              this.ProcesaActualizacionMetadatos(data);
            }
          }
        });
    }
  }

  getLocalISO(date: Date = new Date()): string {
    const pad = (n: number) => n.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are 0-based
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:00Z`;
  }

  private ProcesaActualizacionMetadatos(data: RequestValoresPlantilla) {
    const doc = this.documentosMetadatos.find((d) => d.Id === data.Id);
    data.Id = this.config.ElementoId;
    data.Tipo = this.TipoObjetoMetadatos;
    data.Filtro = this.config.PuntoMontajeId;
    data.FiltroJerarquico = this.config.CarpetaId;

    this.servicioPlantilla
      .ActualizaMetadatosPlantilla(doc.PlantillaId, doc.Id, data)
      .subscribe(
        (x) => {
          doc.Valores = data.Valores;
          const index = this.documentosMetadatos.findIndex(
            (d) => d.Id === data.Id
          );
          this.documentosMetadatos[index] = doc;
          this.DeespliegaMetadatosUnicos();
          this.applog.Exito(
            "",
            "El documento ha sido actualizado satisfactoriamente"
          );
        },
        (e) => {
          this.applog.Falla("", "Error al actualizar documento de datos");
        },
        () => {}
      );
  }

  private ProcesaCreacionMetadatos(data: RequestValoresPlantilla) {
    data.Id = this.config.ElementoId;
    data.Tipo = this.TipoObjetoMetadatos;
    data.Filtro = this.config.PuntoMontajeId;
    data.FiltroJerarquico = this.config.CarpetaId;

    this.servicioPlantilla
      .CreaMetadatosPlantilla(this.listaplantilla.selected, data)
      .subscribe(
        (doc) => {
          this.documentosMetadatos.push(doc);
          this.vinculos.Documentos.push({
            PlantillaId: this.listaplantilla.selected,
            DocumentoId: doc.Id,
            Nombre: "",
          });

          if (
            this.metadatos.findIndex(
              (m) => m.Tipo === this.listaplantilla.selected
            ) < 0
          ) {
            this.servicioPlantilla
              .ObtieneMetadataInfo(this.listaplantilla.selected)
              .subscribe(
                (m) => {
                  this.metadatos.push(m);
                  this.DeespliegaMetadatosUnicos();
                },
                (e) => {},
                () => {}
              );
          } else {
            this.DeespliegaMetadatosUnicos();
          }

          this.applog.Exito(
            "",
            "El documento ha sido creado satisfactoriamente"
          );
        },
        (e) => {
          this.applog.Falla("", "Error al crear documento de datos");
        },
        () => {}
      );
  }

  public EditorPlantillaLista(): void {}

  public opChange(event): void {
    // console.info(event);
  }
}
