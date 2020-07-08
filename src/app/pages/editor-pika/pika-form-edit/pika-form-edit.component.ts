import { AtributoVistaUI } from './../../../@pika/metadata/atributos-vista-ui';
import { TranslateService } from '@ngx-translate/core';
import { ComponenteBase } from './../../../@core/comunes/componente-base';
import { Propiedad } from './../../../@pika/metadata/propiedad';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { EditorService } from '../services/editor-service';
import { takeUntil } from 'rxjs/operators';
import { tBoolean, tInt32, tInt64, tDouble, tDate, tDateTime, tTime } from '../../../@pika/metadata';
import { isDate, parseISO } from 'date-fns';
import { AppLogService } from '../../../@pika/servicios/app-log/app-log.service';
import { Acciones } from '../../../@pika/metadata/acciones-crud';


@Component({
  selector: 'ngx-pika-form-edit',
  templateUrl: './pika-form-edit.component.html',
  styleUrls: ['./pika-form-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
})
export class PikaFormEditComponent extends ComponenteBase  implements OnInit, OnDestroy {
  public formaDinamica: FormGroup;
  opindex: number = 0;
  CurrentOpId: string = '';
  cerrarEditor: boolean = false;
  enLlamadaApi: boolean = false;
  modoEditar: boolean = false;
  entidadEdicion: any = null;
  propiedadesActivas: Propiedad[] = [];
  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(
    ts: TranslateService,
    appLog: AppLogService,
    public editorService: EditorService,
    private fb: FormBuilder,
  ) {
    super(appLog, ts);
    this.ts = ['ui.editar', 'ui.guardar', 'ui.guardar-adicionar'];
  }


  regenerarForma(): void {
    // Onbtiene la lista de controles exietnets
      const controls = Object.keys(this.formaDinamica.controls);

      // Obtiene los objetos de la configuración en base a la lista de nombres
      const configControls = this.editorService.metadatos.Propiedades.map((item) => item.Id);

      // Para cada control que no se encuentre en la lista de existentes
      // Elimina cada control que spertenezca a la configurcion actual
      controls
        .filter((control) => !configControls.includes(control))
        .forEach((control) => {
          this.formaDinamica.removeControl(control);
           });

      // Crea los controles faltantes
      configControls
        .filter((control) => !controls.includes(control))
        .forEach((Id) => {
          const config = this.editorService.metadatos.Propiedades.find((control) => control.Id === Id);
          const controlnuevo = this.createControl(config);
          if (controlnuevo !== null) {
            this.formaDinamica.addControl( config.Id, controlnuevo);
          }
        });
  }

 

  guardar(): void {
    this.cerrarEditor = true;
    if (this.modoEditar) {
      this.ActualizaEntidad();
    } else {
      this.CreaEntidad();
    }
  }

  guardarAdicionar(): void {
    this.cerrarEditor = false;
    this.CreaEntidad();
  }

  private CreaEntidad():  void {
    if ( this.formaDinamica.status !== 'VALID' ) {
      this.appLog.AdvertenciaT('editor-pika.mensajes.err-datos-novalidos');
      return;
    }

     this.opindex++;
     this.editorService.CreaEntidad( this.formaDinamica.getRawValue(), `add-${this.opindex}` );
  }


  private ActualizaEntidad():  void {
    if ( this.formaDinamica.status !== 'VALID' ) {
      this.appLog.AdvertenciaT('editor-pika.mensajes.err-datos-novalidos');
      return;
    }
     this.opindex++;

     this.editorService.ActualizarEntidad(this.entidadEdicion.Id,
      this.formaDinamica.getRawValue(), `add-${this.opindex}` );
  }

  ResetUI(): void {
    // this.CurrentOpId = '';
    // this.cerrarEditor = false;
    // this.enLlamadaApi = false;
    // this.modoEditar = false;
    // this.entidadEdicion = null;
    // this.propiedadesActivas = [];
    const controls = Object.keys(this.formaDinamica.controls);
        controls.forEach((control) => {
          this.formaDinamica.removeControl(control);
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  ngOnInit(): void {
    this.ObtenerTraducciones();
    this.formaDinamica = this.createGroup();
    this.ObtieneResultadoCRUD();
    this.ObtieneEntidadEditar();
    this.FormEvents();
  }

  private FormEvents(): void {
    this.formaDinamica.valueChanges.subscribe( x => {
        
    });
  }

  ObtieneEntidadEditar(): void {
    this.editorService
    .ObtieneEditarEntidad()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((entidad) => {
      this.ResetUI();
      this.propiedadesActivas = [];
      if (entidad) {
        this.modoEditar = true;
        this.regenerarForma();
        this.EstableceValoresEntidad(entidad);
        this.entidadEdicion = entidad;
      } else {
        this.modoEditar = false;
        this.regenerarForma();
        this.EstableceValoresDefault();
      }
    });
  }

  ObtieneEstadoAPI(): void {
    this.editorService
    .ObtieneEnLlamadaAPI()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((enllamada) => {
      this.enLlamadaApi = enllamada;
    });
  }

  ObtieneResultadoCRUD(): void {
    this.editorService
    .ObtieneResultadoAPI()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((resultado) => {
      if (resultado) {
         if (resultado.ok) {
           if (this.cerrarEditor) {
            this.editorService.EstableceTarjetaTraseraVisible(null);
           } else {
            this.EstableceValoresDefault();
           }
         }
      }
    });
  }

  EstableceValoresDefault(): void {
    this.editorService.metadatos.Propiedades.forEach( p => {
      let valor = null;
      valor =  this.getValor(p.Valor, p);
      if (!valor) {
        valor =  this.getValor(p.ValorDefault, p);
      }
      if (this.formaDinamica.controls[p.Id]) {
        this.formaDinamica.controls[p.Id].setValue(valor);
      }
    });
  }

  EstableceValoresEntidad(entidad: any): void {
    this.editorService.metadatos.Propiedades.forEach( p => {
      const valor =  entidad[p.Id];
      if (this.formaDinamica.controls[p.Id])
      this.formaDinamica.controls[p.Id].setValue(valor);
    });
  }


  createGroup() {
    const group = this.fb.group({});
    return group;
  }


  getValor(Valor: string, p: Propiedad): any {


    if (Valor && Valor !== '' ) {

      switch (p.TipoDatoId) {
        case tBoolean:
        if (Valor.toLowerCase() === 'true' || Valor === '1' ) {
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

  createControl(p: Propiedad) {
    const validadorres = [];
    let VistaUI: AtributoVistaUI = null;

    if (p.AtributosVistaUI.length > 0) {
      if (this.modoEditar) {
        VistaUI = p.AtributosVistaUI.filter(x => (x.Accion === Acciones.update) ||
        (x.Accion === Acciones.addupdate))[0];
      } else {
        VistaUI = p.AtributosVistaUI.filter(x => (x.Accion === Acciones.add) ||
        (x.Accion === Acciones.addupdate))[0];
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

        let valor =  this.getValor(p.Valor, p);
        if (!valor) {
          valor =  this.getValor(p.ValorDefault, p);
        }

        const pactiva = {...p};
        pactiva.ControlHTML = VistaUI.Control;

        this.propiedadesActivas.push(pactiva);
        return this.fb.control({ disabled: false, value: valor }, validadorres);

      }

    }


    return null;
  }






}
