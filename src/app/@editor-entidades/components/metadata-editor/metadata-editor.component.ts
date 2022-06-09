import { FiltroConsultaPropiedad } from "./../../../@pika/consulta/filtro.-consulta-propiedad";
import { Evento, Eventos } from "./../../../@pika/metadata";
import { environment } from "./../../../../environments/environment";
import { AppEventBus } from "./../../../@pika/state/app-event-bus";
import { Traductor } from "./../../services/traductor";
import {
  MetadataInfo,
  TipoDespliegueVinculo,
} from "../../../@pika/pika-module";
import { EditorEntidadesBase } from "./../../model/editor-entidades-base";
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { ConfiguracionEntidad } from "../../model/configuracion-entidad";
import { EntidadesService } from "../../services/entidades.service";
import { TranslateService } from "@ngx-translate/core";
import { IEditorMetadatos } from "../../model/i-editor-metadatos";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from "@angular/forms";
import {
  Propiedad,
  tBoolean,
  tInt32,
  tInt64,
  tDouble,
  tDate,
  tDateTime,
  tTime,
  tString,
  tBinaryData,
  tList,
} from "../../../@pika/pika-module";
import { AtributoVistaUI } from "../../../@pika/pika-module";
import { Acciones } from "../../../@pika/pika-module";
import { isDate, parseISO } from "date-fns";
import { first, takeUntil } from "rxjs/operators";
import {
  HTML_PASSWORD_CONFIRM,
  HTML_HIDDEN,
  HTML_CHECKBOX_MULTI,
} from "../../../@pika/pika-module";
import { Subject, timer } from "rxjs";
import { Router } from "@angular/router";
import { DiccionarioNavegacion } from "../../model/i-diccionario-navegacion";
import { EventosInterprocesoService } from "../../services/eventos-interproceso.service";
import { AppLogService } from "../../../services/app-log/app-log.service";

@Component({
  selector: "ngx-metadata-editor",
  templateUrl: "./metadata-editor.component.html",
  styleUrls: ["./metadata-editor.component.scss"],
  providers: [EventosInterprocesoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataEditorComponent
  extends EditorEntidadesBase
  implements IEditorMetadatos, OnInit, OnDestroy, OnChanges, AfterViewInit
{
  // Mantiene la configutación de la entidad obtenida por el ruteo
  @Input() config: ConfiguracionEntidad;
  @Input() metadata: MetadataInfo;
  @Input() entidad: any;
  @Output() NuevaEntidad = new EventEmitter();
  @Output() EntidadActualizada = new EventEmitter();
  @Output() CapturaFinalizada = new EventEmitter();
  private onDestroy$: Subject<void> = new Subject<void>();

  // Forma reactiva host de los componentes
  public formGroup: FormGroup;
  // Especifica si es un proceso de adición (false) o edición (true)
  public modoEditar: boolean = false;

  // Propedades activas para directiva
  public propiedadesActivas: Propiedad[] = [];
  public propiedadesHidden: Propiedad[] = [];
  public propiedadesActivasUI: Propiedad[] = [];

  public filtrosQ: FiltroConsultaPropiedad[] = [];

  // Almacena las propiedades default del objeto
  public valoresDefault = {};

  public T: Traductor;

  public propiedadesEvento: string[] = [];

  public transaccionId: string;

  private formaCreada: boolean = false;

  
  private iteracionesTimer
  private timerRefresco;
  private listDone = false;
  private IniciaTimerRefresco() {
    this.iteracionesTimer = 10;
    this.timerRefresco = timer(100, 500).subscribe(t => {
      this.cdr.detectChanges();
      this.iteracionesTimer -=1;
      if (this.iteracionesTimer == 0){
        this.DetieneTimerRefresco();
      }
    });
  }

  private DetieneTimerRefresco() {
    this.timerRefresco.unsubscribe();
  }

  // Cosntructor del componente
  constructor(
    entidades: EntidadesService,
    appeventBus: AppEventBus,
    private eventosUI: EventosInterprocesoService,
    ts: TranslateService,
    applog: AppLogService,
    router: Router,
    diccionarioNavegacion: DiccionarioNavegacion,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    super(appeventBus, entidades, applog, router, diccionarioNavegacion);
    this.transaccionId = new Date().getMilliseconds().toString();
    this.T = new Traductor(ts);
    this.T.ts = ["ui.editar", "ui.guardar", "ui.guardar-adicionar"];
    this.CargaTraducciones();
    this.formGroup = this.createGroup();

    this.formGroup.valueChanges.subscribe((campos) => {
      if (!environment.production) {
        console.debug(campos);
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  public _Reset(): void {
    this.modoEditar = false;
    this.propiedadesActivas = [];
    this.propiedadesHidden = [];
    this.valoresDefault = {};
    this.filtrosQ = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ProcesaConfiguracion();
  }

  ngOnInit(): void {
    
    this.entidades
      .ObtieneAventosContexto()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((ev) => {
        this.propiedadesActivas.forEach((p) => {
          if (p.IdContextual && p.IdContextual.toLowerCase() === ev.Origen) {
            this.formGroup.get(p.Id).setValue(ev.Valor);
          }
        });
      });
  }

  // Se llama desde el template
  private CreaEntidad(cerrar: boolean): void {
    if (this.formGroup.status !== "VALID") {
      this.applog.AdvertenciaT("editor-pika.mensajes.err-datos-novalidos");
      return;
    }

    const entidadCopiada = this.ClonaEntidad(this.formGroup.getRawValue());

    switch (this.config.TipoDespliegue.toString()) {
      case TipoDespliegueVinculo.Membresia.toString():
        this.entidades
          .ObtieneMetadatos(this.config.OrigenTipo, "")
          .pipe(first())
          .subscribe((m) => {
            const vinculo = m.EntidadesVinculadas.find(
              (x) =>
                x.EntidadHijo.toLowerCase() ===
                  this.config.TipoEntidad.toLowerCase() &&
                x.TipoDespliegue === TipoDespliegueVinculo.Membresia
            );

            this.entidades
              .CreaEntidadMiembro(
                this.config.TipoEntidad,
                entidadCopiada[vinculo.PropiedadHijo],
                [entidadCopiada[vinculo.PropiedadIdMiembro]]
              )
              .pipe(first())
              .subscribe((hecho) => {
                if (cerrar) {
                  this.NuevaEntidad.emit(null);
                  this.CapturaFinalizada.emit();
                } else {
                  this.LimpiarForma();
                }
              });
          });
        break;

      default:
        this.entidades
          .CreaEntidad(this.config.TipoEntidad, entidadCopiada)
          .pipe(first())
          .subscribe((entidad) => {
            if (entidad) {
              this.NuevaEntidad.emit(entidad);
              if (cerrar) {
                this.CapturaFinalizada.emit();
              } else {
                this.LimpiarForma();
              }
            }
          });
        break;
    }
  }

  // Fija el formato de las propieades en base al tipo
  private ClonaEntidad(entidad: any): any {
    this.metadata.Propiedades.forEach((p) => {
      const control = entidad[p.Id];
      if (control) {
        switch (p.TipoDatoId) {
          case tString:
            if(p.AtributosVistaUI?.findIndex(x=>x.Control=='checkboxgroupeditor') >= 0) {
              if (entidad[p.Id] != null) {
                if(typeof entidad[p.Id] === 'string') {
                  entidad[p.Id] = entidad[p.Id].split(',');
                }
              }
            }
            break;
          case tDouble:
            if (entidad[p.Id] != null) {
              entidad[p.Id] = parseFloat(entidad[p.Id]);
            }
            break;
          case tBoolean:
            if (entidad[p.Id] != null) {
              entidad[p.Id] = entidad[p.Id] == true ||  entidad[p.Id] == 'true' ? true : false;
            }
            break;
          case tInt64:
          case tInt32:
            if (entidad[p.Id] != null) {
              entidad[p.Id] = parseInt(entidad[p.Id], 0);
            }
            break;
          case tDateTime:
            break;
          case tDate:
            break;
          case tTime:
            break;
          case tBinaryData:
            break;
          case tList:
            break;
        }
      }
    });

    const entidadcopia = {};
    for (const [key, value] of Object.entries(entidad)) {
      if (value !== null && (this.metadata.Propiedades.findIndex(p=>p.Id == key) >=0 ) ) {
        entidadcopia[key] = value;
      }
    }
    return entidadcopia;
  }

  // Se llama desde el template
  private ActualizaEntidad(): void {
    if (this.formGroup.status !== "VALID") {
      this.applog.AdvertenciaT("editor-pika.mensajes.err-datos-novalidos");
      return;
    }

    const entidadCopiada = this.ClonaEntidad(this.formGroup.getRawValue());
    const Id = this.entidades.ObtenerIdEntidad(
      this.config.TipoEntidad,
      this.entidad
    );
    this.entidades
      .ActualizarEntidad(this.config.TipoEntidad, Id, entidadCopiada)
      .pipe(first())
      .subscribe((entidad) => {
        if (entidad) {
          this.EntidadActualizada.emit(entidad);
          this.CapturaFinalizada.emit();
          this.entidad = null;
          this.modoEditar = false;
        }
      });
  }

  // Procesamiento del componente
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------

  private ProcesaConfiguracion() {
    this._Reset();

    if (this.entidad) {
      this.modoEditar = true;
    }

    this.LimpiarForma();
    this.ObtieneValoresVinculados();
    if (this.metadata) {
      if (navigator.userAgent.indexOf("Firefox") >= 0) {
        const temp = [];
        for (var i = this.metadata.Propiedades.length - 1; i >= 0; i--) {
          temp.push({ ...this.metadata.Propiedades[i] });
        }
        this.metadata.Propiedades = temp;
      }
      this.metadata.Propiedades.forEach((p) => {
        if (p.AtributosEvento && p.AtributosEvento.length > 0) {
          p.AtributosEvento.forEach((ev) => {
            if (this.propiedadesEvento.indexOf(ev.Entidad) < 0) {
              this.propiedadesEvento.push(ev.Entidad.toLowerCase());
            }
          });
        }
      });

      this.metadata.Propiedades.forEach((p) => {
        p.EmitirCambiosValor =
          this.propiedadesEvento.indexOf(p.Id.toLowerCase()) >= 0;
      });

      const requiereFiltros = this.metadata.Propiedades.filter(
        (x) => x.AtributoLista?.FiltroBusqueda == true
      );
      
      if (requiereFiltros.length > 0) {
        this.entidades
          .GetFiltroBusqueda(this.metadata.Tipo, this.config.OrigenId)
          .subscribe((f) => {
            this.filtrosQ = f;
            this.CrearForma();
          });
      } else {
        this.CrearForma();
      }
    }

    if (this.entidad) {
      this.AsignarValoresForma(this.entidad);
    }
  }

  private CrearForma(): void {
    this.formaCreada = false;
    // Onbtiene la lista de controles exietnets
    const controls = Object.keys(this.formGroup.controls);

    // Obtiene los objetos de la configuración en base a la lista de nombres
    const configControls = this.metadata.Propiedades.sort(
      (x) => x.IndiceOrdenamiento
    ).map((item) => item.Id);

    // Para cada control que no se encuentre en la lista de existentes
    // Elimina cada control que spertenezca a la configurcion actual
    controls
      .filter((control) => !configControls.includes(control))
      .forEach((control) => {
        this.formGroup.removeControl(control);
      });

    // Crea los controles faltantes
    configControls
      .filter((control) => !controls.includes(control))
      .forEach((Id) => {
        const config = this.metadata.Propiedades.find(
          (control) => control.Id === Id
        );
        const attr = config.AtributosVistaUI.find(
          (x) => x.Plataforma === "web"
        ).Control;

        let controlnuevo = null;
        switch (attr) {
          case HTML_CHECKBOX_MULTI:
            const g = this.fb.group({ valores: new FormArray([]) });
            const hidden = this.fb.control({ disabled: false, value: [] });
            this.formGroup.addControl(config.Id + "-valores", g);
            this.formGroup.addControl(config.Id, hidden);
            const pactiva = { ...config };
            pactiva.ControlHTML = HTML_CHECKBOX_MULTI;
            this.propiedadesActivas.push(pactiva);
            break;

          default:
            controlnuevo = this.CreateControl(config, true);
            if (controlnuevo !== null) {
              this.formGroup.addControl(config.Id, controlnuevo);
              if (attr === HTML_PASSWORD_CONFIRM) {
                const controladicional = this.CreateControl(config, false);
                const validador = this.CreaCampoOcultoPasswordConfirm();
                this.formGroup.addControl(config.Id + "conf", controladicional);
                this.formGroup.addControl(config.Id + "valid", validador);
              }
            }
            break;
        }
      });
    this.AsignarValoresDefault();
    this.propiedadesActivasUI = this.propiedadesActivas;
    this.formaCreada = true;
  }

  private LimpiarForma(): void {
    this.AsignarValoresDefault();
  }

  private ObtieneValoresVinculados(): void {
    if (this.config.OrigenId !== "" && this.config.OrigenTipo !== "") {
      this.entidades
        .ObtieneMetadatos(this.config.OrigenTipo, "")
        .pipe(first())
        .subscribe((m) => {
          const index = m.EntidadesVinculadas.findIndex(
            (x) =>
              x.EntidadHijo.toLowerCase() ===
              this.config.TipoEntidad.toLowerCase()
          );
          if (index >= 0) {
            const link = m.EntidadesVinculadas[index];
            this.valoresDefault[link.PropiedadHijo] = this.config.OrigenId;
          }
        });
    }
  }

  // Actualiza los valores de la forma para la entidad
  private AsignarValoresForma(entidad: any): void {
    if (entidad) {
      const controls = Object.keys(this.formGroup.controls);
      controls.forEach((control) => {
        if (this.formGroup.get(control) instanceof FormControl) {
          this.formGroup.get(control).setValue(null);
          if (
            this.entidad[control] !== null &&
            this.entidad[control] !== undefined
          ) {
            this.EmiteEventoCambio(
              control,
              String(this.entidad[control]),
              this.transaccionId
            );
          }
        }
      });

      controls.forEach((control) => {
        if (this.formGroup.get(control) instanceof FormControl) {
          this.formGroup.get(control).setValue(null);
          if (entidad[control] !== null && entidad[control] !== undefined) {
            this.formGroup.get(control).setValue(String(entidad[control]));
          }
        }
      });
    }
    this.cdr.detectChanges();
    this.IniciaTimerRefresco();
  }

  ngAfterViewInit(): void {
    this.AsignarValoresForma(this.entidad);
  }

  EmiteEventoCambio(Id: string, Valor: any, Transaccion: string) {
    const evt: Evento = {
      Origen: Id,
      Valor: Valor,
      Evento: Eventos.AlCambiar,
      Transaccion: Transaccion,
    };
    this.eventosUI.EmiteEvento(evt);
  }

  // Establece los valores por defecto en el grupo
  private AsignarValoresDefault(): void {
    this.metadata.Propiedades.forEach((p) => {
      if (p.Contextual) {
        const partes = p.IdContextual.split(".");
        const valor = this.entidades.GetPropiedadCacheContextual(
          partes[1],
          partes[0],
          ""
        );
        if (valor != null) {
          if (this.formGroup.get(p.Id)) {
            this.formGroup.get(p.Id).setValue(valor);
          }
        }
      }
    });

    const controls = Object.keys(this.formGroup.controls);
    controls.forEach((control) => {
      if (this.valoresDefault[control]) {
        this.formGroup.get(control).setValue(this.valoresDefault[control]);
      }
    });
  }

  // Obtiene el valor default para una propiedad
  private GetValor(Valor: string, p: Propiedad): any {
    if (Valor && Valor !== "") {
      switch (p.TipoDatoId) {
        case tBoolean:
          if (Valor.toLowerCase() === "true" || Valor === "1") {
            return true;
          } else {
            return false;
          }

        case tInt32:
        case tInt64:
          if (!isNaN(+Valor)) {
            return parseInt(Valor, 10);
          }
          break;

        case tDouble:
          if (!isNaN(+Valor)) {
            return parseFloat(Valor);
          }
          break;

        case tDate:
        case tDateTime:
        case tTime:
          if (isDate(Valor)) {
            return parseISO(Valor);
          }
          break;

        default:
          return Valor;
      }
    }

    return null;
  }

  private CreaCampoOcultoPasswordConfirm(): FormControl {
    const validadorres = [];
    validadorres.push(Validators.minLength(2));
    return this.fb.control({ disabled: false, value: "" }, validadorres);
  }

  // Crea  un control para la forma dinámica
  private CreateControl(p: Propiedad, AdicionaPropiedad: boolean): FormControl {
    const validadorres = [];
    let VistaUI: AtributoVistaUI = null;

    if (p.AtributosVistaUI.length > 0) {
      if (this.modoEditar) {
        VistaUI = p.AtributosVistaUI.filter(
          (x) => x.Accion === Acciones.update || x.Accion === Acciones.addupdate
        )[0];
      } else {
        VistaUI = p.AtributosVistaUI.filter(
          (x) => x.Accion === Acciones.add || x.Accion === Acciones.addupdate
        )[0];
      }

      if (VistaUI) {
        if (p.Requerido) {
          validadorres.push(Validators.required);
        }

        if (p.ValidadorTexto) {
          validadorres.push(Validators.minLength(p.ValidadorTexto.longmin));
          validadorres.push(Validators.maxLength(p.ValidadorTexto.longmax));
          if (p.ValidadorTexto.regexp) {
            validadorres.push(Validators.pattern(p.ValidadorTexto.regexp));
          }
        }

        if (p.ValidadorNumero) {
          if (p.ValidadorNumero.UtilizarMin)
            validadorres.push(Validators.min(p.ValidadorNumero.min));

          if (p.ValidadorNumero.UtilizarMax)
            validadorres.push(Validators.max(p.ValidadorNumero.max));
        }

        let valor = this.GetValor(p.Valor, p);
        if (!valor) {
          valor = this.GetValor(p.ValorDefault, p);
        }

        if (AdicionaPropiedad) {
          const pactiva = { ...p };
          pactiva.ControlHTML = VistaUI.Control;
          if (pactiva.ControlHTML === HTML_HIDDEN) {
            this.propiedadesHidden.push(pactiva);
          } else {
            this.propiedadesActivas.push(pactiva);
          }
        }

        return this.fb.control({ disabled: false, value: valor }, validadorres);
      }
    }

    return null;
  }

  // Crea el grupo host de los controles
  createGroup() {
    const group = this.fb.group({});
    return group;
  }

  private CargaTraducciones(): void {
    this.T.ts = ["ui.editar", "ui.guardar", "ui.guardar-adicionar"];
    this.T.ObtenerTraducciones();
  }
}
