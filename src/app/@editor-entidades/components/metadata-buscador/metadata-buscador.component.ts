import { AppEventBus } from './../../../@pika/state/app-event-bus';
import { CacheFiltrosBusqueda } from './../../services/cache-filtros-busqueda';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Propiedad } from '../../../@pika/pika-module';
import { MetadataInfo } from '../../../@pika/pika-module';
import { FiltroConsulta } from '../../../@pika/pika-module';
import { AppLogService } from '../../../@pika/pika-module';
import { EditorEntidadesBase } from './../../model/editor-entidades-base';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { EntidadesService, EventosFiltrado } from '../../services/entidades.service';
import { TranslateService } from '@ngx-translate/core';
import { IBuscadorMetadatos } from '../../model/i-buscador-metadatos';
import {
  tDateTime,
  tDate,
  tTime,
  tDouble,
  tInt32,
  tInt64,
} from '../../../@pika/pika-module';
import {
  CTL_OP_PREFIX,
  CTL2_PREFIX,
  CTL_NEG_PREFIX,
  CTL1_PREFIX,
} from '../../model/constantes';
import { Router } from '@angular/router';
import { Traductor } from '../../services/traductor';
import { DiccionarioNavegacion } from '../../model/i-diccionario-navegacion';



@Component({
  selector: 'ngx-metadata-buscador',
  templateUrl: './metadata-buscador.component.html',
  styleUrls: ['./metadata-buscador.component.scss'],
})
export class MetadataBuscadorComponent extends EditorEntidadesBase
  implements IBuscadorMetadatos, OnInit, OnDestroy {

  private onDestroy$ = new Subject();
  // Mantiene la configutación de la entidad obtenida por el ruteo
  @Input() config: ConfiguracionEntidad;
  @Input() metadata: MetadataInfo;
  @Input() lateral: boolean;
  @Output() EventoFiltrar = new EventEmitter();

  // Porpieades válidas para el filtrado
  public propiedades: Propiedad[] = [];

  // Porpieades establecidas como filtro
  public propiedadesFiltro: Propiedad[] = [];

  // lista de los filtros válidos configurads
  private filtros: FiltroConsulta[] = [];

  // Id de la Propiedad seleccionad para la adición en filtros
  public selectedPropId: string = null;

  public group: FormGroup;

  // Especifica si la entidad tiene eliminar logico
  public eliminarLogico: boolean = false;

  public T: Traductor;

  // Cosntructor del componente
  constructor(
    private cacheFiltros: CacheFiltrosBusqueda,
    appeventBus: AppEventBus,
    entidades: EntidadesService,
    ts: TranslateService,
    applog: AppLogService,
    router: Router,
    private fb: FormBuilder,
    diccionarioNavegacion: DiccionarioNavegacion,
  ) {
    super(appeventBus, entidades, applog, router, diccionarioNavegacion);
    this.T = new Traductor(ts);
    this.T.ts = ['ui.filtrarpor', 'ui.adicionar', 'ui.aplicar'];
    this.group = this.fb.group({});
    this.EventosFiltrado();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  public _Reset() {
    this.propiedades = [];
    this.propiedadesFiltro = [];
    this.filtros = [];
    this.selectedPropId = null;
    this.eliminarLogico = false;
  }

  private ProcesaConfiguracion(): void {
    this._Reset();
    if (this.metadata && this.metadata.Propiedades.length > 0) {
      this.filtros = [];
      this.propiedades = this.metadata.Propiedades.filter(
        (x) => x.Buscable === true,
      );
      const filtros = this.cacheFiltros.GetCacheFiltros(this.config.TransactionId);
      filtros.forEach((item) => {
        const index = this.propiedades.findIndex((x) => x.Id === item.Id);
        if (index >= 0) {
          this._addFiltro(item.Id, item);
        }
      });
      this.regenerarForma();
    }
  }

  private EventosFiltrado() {
    this.entidades.ObtieneEventosFiltros().pipe(
      takeUntil(this.onDestroy$)
    )
    .subscribe(ev => {
        switch(ev){
          case EventosFiltrado.EliminarFiltros:
            this.borrarFiltrosBuscador();
            break;
        }
    });
  }

  borrarFiltrosBuscador(): void {
    const fs = this.cacheFiltros.GetCacheFiltros(this.config.TransactionId);
    this._EliminarTodosFiltros();
    fs.forEach( f => {
      this._addFiltro(f.Id, null);
    });
  }

  // Genra el iltro base para las entidades con eliminación lógica
  addFiltro(): void {
    if (this.selectedPropId) {
      this._addFiltro(this.selectedPropId, null);
      this.regenerarForma();
    }
  }

  GetfiltroDefault(p: Propiedad) {
    return this.filtros.find((x) => x.Id === p.Id);
  }

  private _addFiltro(id: string, filtro: FiltroConsulta) {
    const propiedad = this.propiedades.find((x) => x.Id === id);
    if (propiedad) {
      const existente = this.propiedadesFiltro.find((x) => x.Id === id);
      if (existente) {
        this.applog.AdvertenciaT('editor-pika.mensajes.warn-filtros-existente');
      } else {
        this.propiedadesFiltro.push(propiedad);

        if (filtro) {
          this.filtros.push(filtro);
        } else {
          // añade un valor a la lista de filtros seleccioandos
          const fc = new FiltroConsulta();
          fc.Id = propiedad.Id;
          fc.Valido = false;
          this.filtros.push(fc);
        }
      }
    }
  }

  // Ontiene el maximo numero de campos en base al tipo de datoa
  maxCampos(p: Propiedad): number {
    switch (p.TipoDatoId) {
      case tDateTime:
      case tDate:
      case tTime:
      case tDouble:
      case tInt32:
      case tInt64:
        return 2;
    }

    return 1;
  }

  regenerarForma(): void {
    // Onbtiene la lista de controles exietnets
    const controls = Object.keys(this.group.controls);
    // Obtiene los campos en la forma a aprtir de la configuracion
    const configControls = [];
    const Ids: string[] = [];
    this.propiedadesFiltro.forEach((c) => {
      configControls.push(CTL1_PREFIX + c.Id);
      configControls.push(CTL_OP_PREFIX + c.Id);
      configControls.push(CTL_NEG_PREFIX + c.Id);
      configControls.push(CTL2_PREFIX + c.Id);
      // if (this.maxCampos(c) === 2) configControls.push(CTL2_PREFIX + c.Id);
    });
    // Elimina los campos que ya no estan en ñla configuracion
    // y que estaban en la forma
    controls
      .filter((control) => !configControls.includes(control))
      .forEach((control) => {
        this.group.removeControl(control);
      });

    // Crea los comtroles faltantes
    this.propiedadesFiltro.forEach((c) => {
      let n = CTL_OP_PREFIX + c.Id;
      if (!controls.includes(n)) {
        this.group.addControl(CTL_OP_PREFIX + c.Id, this.createControl(c));
      }

      n = CTL_NEG_PREFIX + c.Id;
      if (!controls.includes(n)) {
        this.group.addControl(CTL_NEG_PREFIX + c.Id, this.createControl(c));
      }

      n = CTL1_PREFIX + c.Id;
      if (!controls.includes(n)) {
        this.group.addControl(CTL1_PREFIX + c.Id, this.createControl(c));
      }

      n = CTL2_PREFIX + c.Id;
      if (!controls.includes(n)) {
        this.group.addControl(CTL2_PREFIX + c.Id, this.createControl(c));
      }


    });
  }

  createControl(p: Propiedad) {
    return this.fb.control({ disabled: false, value: null }, []);
  }

  filtrar(): void {
    if (
      this.filtros.findIndex((x) => x.Valido === false) >= 0
    ) {
      this.applog.AdvertenciaT(
        'editor-pika.mensajes.warn-sin-filtros-busqueda',
      );
      return;
    }
    this.EventoFiltrar.emit(this.filtros);
  }

  EstadoFiltro(filtro: FiltroConsulta) {
    const index = this.filtros.findIndex((x) => x.Id === filtro.Id);
    if (index < 0) {
      this.filtros.push(filtro);
    } else {
      this.filtros[index] = filtro;
    }
  }

  EliminarFiltro(filtro: FiltroConsulta) {
    this._EliminarFiltro(filtro);
  }


  private _EliminarTodosFiltros() {
    this.propiedadesFiltro.forEach(
      p => {
        this.group.removeControl(CTL1_PREFIX + p.Id);
        this.group.removeControl(CTL_NEG_PREFIX + p.Id);
        this.group.removeControl(CTL_OP_PREFIX + p.Id);
        if (this.maxCampos(p) === 2) {
          this.group.removeControl(CTL2_PREFIX + p.Id);
        }
      }
    );
    this.propiedadesFiltro = [];
  }

  private _EliminarFiltro(filtro: FiltroConsulta) {
    const index = this.propiedadesFiltro.findIndex((x) => x.Id === filtro.Id);
    if (index >= 0) {
      const p = this.propiedadesFiltro[index];
      this.group.removeControl(CTL1_PREFIX + p.Id);
      this.group.removeControl(CTL_NEG_PREFIX + p.Id);
      this.group.removeControl(CTL_OP_PREFIX + p.Id);
      if (this.maxCampos(p) === 2) {
        this.group.removeControl(CTL2_PREFIX + p.Id);
      }
      this.propiedadesFiltro.splice(index, 1);

      const findex = this.filtros.findIndex((x) => x.Id === filtro.Id);
      if (findex >= 0) {
        this.filtros.splice(findex, 1);
      }
    }
  }

  ngOnInit(): void {
    this.T.ObtenerTraducciones();
    this.ProcesaConfiguracion();
  }
}
