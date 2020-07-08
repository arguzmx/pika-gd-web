import { TranslateService } from '@ngx-translate/core';
import { ComponenteBase } from './../../../@core/comunes/componente-base';
import { AppLogService } from './../../../@pika/servicios/app-log/app-log.service';
import { Propiedad } from './../../../@pika/metadata/propiedad';
import { FiltroConsulta } from './../../../@pika/consulta/filtro-consulta';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnDestroy,
  Input,
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EditorService } from '../services/editor-service';
import {
  tDateTime,
  tDate,
  tTime,
  tInt32,
  tInt64,
  tDouble,
} from '../../../@pika/metadata';
import {
  CTL_OP_PREFIX,
  CTL_NEG_PREFIX,
  CTL1_PREFIX,
  CTL2_PREFIX,
} from '../model/campo';

@Component({
  selector: 'ngx-pika-form-search',
  styleUrls: ['./pika-form-search.component.scss'],
  templateUrl: './pika-form-search.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
})
export class PikaFormSearchComponent extends ComponenteBase  implements OnInit, OnDestroy {
  public PropiedadesFiltro: Propiedad[] = [];
  public Propiedades: Propiedad[] = [];
  @Input() GrupoFiltrosId: string;

  public selectedProp: string;
  public formaDinamica: FormGroup;

  private onDestroy$: Subject<void> = new Subject<void>();
  private filtros: FiltroConsulta[] = [];

  constructor(
    ts: TranslateService,
    appLog: AppLogService,
    private editorService: EditorService,
    private fb: FormBuilder,
  ) {
    super(appLog, ts);
    this.ts = ['ui.filtrarpor', 'ui.adicionar', 'ui.aplicar'];
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

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
    const controls = Object.keys(this.formaDinamica.controls);

    // Obtiene los campos en la forma a aprtir de la configuracion
    const configControls = [];
    const Ids: string[] = [];
    this.PropiedadesFiltro.forEach((c) => {
      configControls.push(CTL_OP_PREFIX + c.Id);
      configControls.push(CTL_NEG_PREFIX + c.Id);
      configControls.push(CTL1_PREFIX + c.Id);
      if (this.maxCampos(c) === 2) configControls.push(CTL2_PREFIX + c.Id);
    });

    // Elimina los campos que ya no estan en ñla configuracion
    // y que estaban en la forma
    controls
      .filter((control) => !configControls.includes(control))
      .forEach((control) => {
        this.formaDinamica.removeControl(control);
      });

    // Crea los comtroles faltantes
    this.PropiedadesFiltro.forEach((c) => {
      let n = CTL_OP_PREFIX + c.Id;
      if (!controls.includes(n)) {
        this.formaDinamica.addControl(
          CTL_OP_PREFIX + c.Id,
          this.createControl(c),
        );
      }

      n = CTL_NEG_PREFIX + c.Id;
      if (!controls.includes(n)) {
        this.formaDinamica.addControl(
          CTL_NEG_PREFIX + c.Id,
          this.createControl(c),
        );
      }

      n = CTL1_PREFIX + c.Id;
      if (!controls.includes(n)) {
        this.formaDinamica.addControl(
          CTL1_PREFIX + c.Id,
          this.createControl(c),
        );
      }
      if (this.maxCampos(c) === 2) {
        n = CTL2_PREFIX + c.Id;
        if (!controls.includes(n)) {
          this.formaDinamica.addControl(
            CTL2_PREFIX + c.Id,
            this.createControl(c),
          );
        }
      }
    });
  }

  ngOnInit(): void {
    this.formaDinamica = this.createGroup();
    this.FiltrosEliminadosListener();
    this.FiltrosListener();
    this.ObtieneMetadatosListener();
    this.ObtenerTraducciones();
    this.OtieneReset();
  }

  OtieneReset() {
    this.editorService
    .ObtieneResetUI()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((reset) => {
      if (reset) {
        this.regenerarForma();
      }
    });
  }


  // Recibe todos las propiedades disponibles
  ObtieneMetadatosListener() {
    this.editorService
      .ObtieneMetadatosDisponibles()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((metadatos) => {
        if (metadatos) {
          // asigna todas las propeidades que estan marcadas para b´suqueda
          this.Propiedades = metadatos.Propiedades.filter(
            (x) => x.Buscable === true,
          );
        }
      });
  }

  FiltrosEliminadosListener(): void {
    this.editorService
      .ObtieneFiltrosEliminados()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((item) => {
        if (item) {
          const index = this.PropiedadesFiltro.indexOf(item, 0);
          if (index > -1) {
            this.PropiedadesFiltro.splice(index, 1);
          }
          this.regenerarForma();
        }
      });
  }

  FiltrosListener(): void {
    this.editorService
      .ObtieneFiltros()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((filtros) => {
        this.filtros = filtros;
      });
  }

  createGroup() {
    const group = this.fb.group({});
    return group;
  }

  createControl(p: Propiedad) {
    return this.fb.control({ disabled: false, value: null }, []);
  }

  filtrar(): void {
    // Verifica que en caso de tener algun filtro al menos uno se halle configurado
    if (this.filtros.length === 0 && this.PropiedadesFiltro.length > 0) {
      this.appLog.AdvertenciaT('editor-pika.mensajes.warn-sin-filtros-busqueda');
      return;
    }

    this.editorService.EstablecerFiltrosValidos();
  }

  addFiltro(): void {
    if (this.selectedProp) {
      const propiedad = this.Propiedades.find(
        (x) => x.Id === this.selectedProp,
      );
      if (propiedad) {
        const existente = this.PropiedadesFiltro.find(
          (x) => x.Id === this.selectedProp,
        );
        if (existente) {
          this.appLog.AdvertenciaT(
            'editor-pika.mensajes.warn-filtros-existente',
          );
        } else {
          this.PropiedadesFiltro.push(propiedad);
          this.regenerarForma();
        }
      }
    }
  }

  eliminarFiltros(): void {
    this.PropiedadesFiltro = [];
    this.regenerarForma();
    this.editorService.EliminarTodosFiltros();
  }
}
