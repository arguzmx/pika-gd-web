import { MetadataInfo } from './../../../../@pika/metadata/metadata-info';
import { AppLogService } from './../../../../@pika/servicios/app-log/app-log.service';
import { EditorEntidadesBase } from './../../model/editor-entidades-base';
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { EntidadesService } from '../../services/entidades.service';
import { TranslateService } from '@ngx-translate/core';
import { IEditorMetadatos } from '../../model/i-editor-metadatos';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  Propiedad,
  tBoolean,
  tInt32,
  tInt64,
  tDouble,
  tDate,
  tDateTime,
  tTime,
} from '../../../../@pika/metadata';
import { AtributoVistaUI } from '../../../../@pika/metadata/atributos-vista-ui';
import { Acciones } from '../../../../@pika/metadata/acciones-crud';
import { isDate, parseISO } from 'date-fns';
import { first } from 'rxjs/operators';

@Component({
  selector: 'ngx-metadata-editor',
  templateUrl: './metadata-editor.component.html',
  styleUrls: ['./metadata-editor.component.scss'],
})
export class MetadataEditorComponent extends EditorEntidadesBase
  implements IEditorMetadatos, OnInit, OnChanges {
  // Mantiene la configutación de la entidad obtenida por el ruteo
  @Input() config: ConfiguracionEntidad;
  @Input() metadata: MetadataInfo;
  @Input() entidad: any;
  @Output() NuevaEntidad = new EventEmitter();
  @Output() EntidadActualizada = new EventEmitter();
  @Output() CapturaFinalizada = new EventEmitter();

  // Forma reactiva host de los componentes
  public formGroup: FormGroup;
  // Especifica si es un proceso de adición (false) o edición (true)
  public modoEditar: boolean = false;

  // Propedades activas para directiva
  public propiedadesActivas: Propiedad[] = [];

  // Almacena las propiedades default del objeto
  public valoresDefault = {};

  // Cosntructor del componente
  constructor(
    entidades: EntidadesService,
    ts: TranslateService,
    applog: AppLogService,
    private fb: FormBuilder,
  ) {
    super(entidades, ts, applog);
    this.ts = ['ui.editar', 'ui.guardar', 'ui.guardar-adicionar'];
    this.formGroup = this.createGroup();
    // this.formGroup.valueChanges.subscribe( x => {
    //    // console.log(x);
    // });
  }

  public _Reset(): void {
    this.modoEditar = false;
    this.propiedadesActivas = [];
    this.valoresDefault = {};
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ProcesaConfiguracion();
  }

  ngOnInit(): void {
    this.ObtenerTraducciones();
    this.CargaTraducciones();

  }

  // Se llama desde el template
  private CreaEntidad(cerrar: boolean): void {
    if (this.formGroup.status !== 'VALID') {
      this.applog.AdvertenciaT('editor-pika.mensajes.err-datos-novalidos');
      return;
    }

    this.entidades
      .CreaEntidad(this.config.TipoEntidad, this.formGroup.getRawValue())
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
  }

  // Se llama desde el template
  private ActualizaEntidad(): void {
    if (this.formGroup.status !== 'VALID') {
      this.applog.AdvertenciaT('editor-pika.mensajes.err-datos-novalidos');
      return;
    }

    const Id = this.entidades.ObtenerIdEntidad(
      this.config.TipoEntidad,
      this.entidad,
    );
    this.entidades
      .ActualizarEntidad(
        this.config.TipoEntidad,
        Id,
        this.formGroup.getRawValue(),
      )
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

    if (this.metadata ) {
      this.ObtieneValoresVinculados();
      this.LimpiarForma();
      this.CrearForma();
    }

    if (this.entidad) {
      this.modoEditar = true;
      this.AsignarValoresForma(this.entidad);
    }
  }

  private CrearForma(): void {
    // Onbtiene la lista de controles exietnets
    const controls = Object.keys(this.formGroup.controls);

    // Obtiene los objetos de la configuración en base a la lista de nombres
    const configControls = this.metadata.Propiedades.map((item) => item.Id);

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
          (control) => control.Id === Id,
        );
        const controlnuevo = this.CreateControl(config);
        if (controlnuevo !== null) {
          this.formGroup.addControl(config.Id, controlnuevo);
        }
      });

      this.AsignarValoresDefault();
  }

  private LimpiarForma(): void {
    this.propiedadesActivas = [];
    if (this.formGroup.controls) {
      const controls = Object.keys(this.formGroup.controls);
      controls.forEach((control) => {
        this.formGroup.removeControl(control);
      });
    }
  }


  private ObtieneValoresVinculados():  void {
    if (this.config.OrigenId !== '' && this.config.OrigenTipo !== '') {
      this.entidades.ObtieneMetadatos(this.config.OrigenTipo).pipe(first())
      .subscribe( m => {
        const index  = m.EntidadesVinculadas
        .findIndex( x => x.EntidadHijo === this.config.TipoEntidad);
        if ( index >= 0 ) {
          const link = m.EntidadesVinculadas[index];
              this.valoresDefault[link.PropiedadHijo] = this.config.OrigenId;
        }
      });
    }
  }

  // Actualiza los valores de la forma para la entidad
  private AsignarValoresForma(entidad: any): void {
    const controls = Object.keys(this.formGroup.controls);
    controls.forEach((control) => {
      this.formGroup.get(control).setValue(null);
      if (entidad[control] !== null && entidad[control] !== undefined) {
        this.formGroup.get(control).setValue(entidad[control]);
      }
    });
  }


  // Establece los valores por defecto en el grupo
  private AsignarValoresDefault(): void {
    const controls = Object.keys(this.formGroup.controls);
    controls.forEach((control) => {
      if (this.valoresDefault[control]) {
        this.formGroup.get(control).setValue(this.valoresDefault[control]);
      }
    });
  }

  // Ontiene el valor default para una propiedad
  private GetValor(Valor: string, p: Propiedad): any {
    if (Valor && Valor !== '') {
      switch (p.TipoDatoId) {
        case tBoolean:
          if (Valor.toLowerCase() === 'true' || Valor === '1') {
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

  // Crea  un control para la forma dinámica
  private CreateControl(p: Propiedad): FormControl {
    const validadorres = [];
    let VistaUI: AtributoVistaUI = null;

    if (p.AtributosVistaUI.length > 0) {
      if (this.modoEditar) {
        VistaUI = p.AtributosVistaUI.filter(
          (x) => x.Accion === Acciones.update || x.Accion === Acciones.addupdate,
        )[0];
      } else {
        VistaUI = p.AtributosVistaUI.filter(
          (x) =>
            x.Accion === Acciones.add ||
            x.Accion === Acciones.addupdate ||
            x.Accion === Acciones.update,
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
          validadorres.push(Validators.min(p.ValidadorNumero.min));
          validadorres.push(Validators.max(p.ValidadorTexto.longmax));
        }

        let valor = this.GetValor(p.Valor, p);
        if (!valor) {
          valor = this.GetValor(p.ValorDefault, p);
        }

        const pactiva = { ...p };
        pactiva.ControlHTML = VistaUI.Control;

        this.propiedadesActivas.push(pactiva);
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
    this.ts = ['ui.editar', 'ui.guardar', 'ui.guardar-adicionar'];
    this.ObtenerTraducciones();
  }
}
