import { FiltroConsulta } from './../../../@pika/consulta/filtro-consulta';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation,
  OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { ConfigCampo } from './search-fields/config-campo';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Propiedad, tDouble, tDateTime, tInt32,
  tInt64, tDate, tTime, tList } from '../../../@pika/metadata';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EditorService } from '../services/editor-service';
import { NbToastrService } from '@nebular/theme';


@Component({
  selector: 'ngx-pika-form-search',
  styleUrls:  ['./pika-form-search.component.scss'],
  templateUrl: './pika-form-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PikaFormSearchComponent implements OnInit, OnDestroy {
private index: number = 1;
private CTL_PREFIX: string = 'ctl-';
private CTL_SUFIX_2ND: string = '-2nd';
private SEL_PREFIX: string = 'sel-';
private NEG_PREFIX: string = 'neg-';
public propiedes: Propiedad[] = [];
public Campos: ConfigCampo[] = [];
@Input() GrupoFiltrosId: string;

public selectedProp: string;
public formaDinamica: FormGroup;
get controls() { return this.Campos.filter(({type}) => type !== 'button'); }
get changes() { return this.formaDinamica.valueChanges; }
get valid() { return this.formaDinamica.valid; }
get value() { return this.formaDinamica.value; }

private onDestroy$: Subject<void> = new Subject<void>();
private filtros: FiltroConsulta[] = [];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private editorService: EditorService,
    private toastrService: NbToastrService,
    private fb: FormBuilder,
  ) {

  }

  ngOnDestroy(): void {
       this.onDestroy$.next();
  }

  regenerarForma(): void {
    // Onbtiene la lista de controles exietnets
      const controls = Object.keys(this.formaDinamica.controls);

      // Obtiene los objetos de la configuración en base a la lista de nombres
      const configControls = this.controls.map((item) => item.name);

      // Para cada control que no se encuentre en la lista de existentes
      // Elimina cada control que spertenezca a la configurcion actual
      controls
        .filter((control) => !configControls.includes(control))
        .forEach((control) => {
           if ( (!control.startsWith(this.SEL_PREFIX))
           &&  (!control.startsWith(this.NEG_PREFIX))
           &&  (!control.endsWith(this.CTL_SUFIX_2ND))) {
            this.formaDinamica.removeControl(control);
           }
           });

      // Crea los controles faltantes
      configControls
        .filter((control) => !controls.includes(control))
        .forEach((name) => {
          const config = this.Campos.find((control) => control.name === name);
          this.formaDinamica.addControl(config.name, this.createControl(config));
          this.formaDinamica.addControl(config.negCheckboxCtlId, this.createNegControl(config));
          this.formaDinamica.addControl(config.selOpCtlId, this.createSelControl(config));
          if(config.secondValId) this.formaDinamica.addControl(config.secondValId, this.createControl(config));
        });
  }



  ngOnInit(): void {
    this.formaDinamica = this.createGroup();
    this.FiltrosEliminadosListener();
    this.FiltrosEliminarTodosListener();
    this.FiltrosListener();
    this.ObtieneMetadatosListener();
  }

  ObtieneMetadatosListener() {
    this.editorService
      .ObtieneMetadatosDisponibles()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((validos) => {
        if (validos) {
          this.propiedes = this.editorService.GetCamposFlitrables();
        }
      });
  }

  FiltrosEliminadosListener(): void {
    this.editorService.ObtieneFiltrosEliminados()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( item => {
      if (item) {
        const index = this.Campos.indexOf(item, 0);
        if (index > -1) {
          this.Campos.splice(index, 1);
        }
        this.regenerarForma();
      }
    });
  }


  FiltrosEliminarTodosListener(): void {
    this.editorService.ObtieneEliminarTodos()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( item => {
      if (item) {
        this.Campos = [];
      }
    });
  }

  FiltrosListener(): void {
    this.editorService.ObtieneFiltros()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( filtros => {
      this.filtros = filtros;
    });
  }


  createGroup() {
    const group = this.fb.group({});
    this.Campos.forEach(control => group.addControl(control.name, this.createControl(control)));
    return group;
  }

  createControl(config: ConfigCampo) {
    const { disabled, validation, value } = config;
    return this.fb.control({ disabled, value }, validation);
  }

  createNegControl(config: ConfigCampo) {
    const { disabled, validation, value } = { disabled: false, validation:[], value: false };
    return this.fb.control({ disabled, value }, validation);
  }

  createSelControl(config: ConfigCampo) {
    const { disabled, validation, value } = { disabled: false, validation:[], value: false };
    return this.fb.control({ disabled, value }, validation);
  }


  filtrar(): void {

    // Verifica que en caso de tener algun filtro al menos uno se halle configurado
    if((this.filtros.length === 0) && (this.Campos.length > 0) ) {
      this.toastrService.warning('No tiene filtros válidos en la consulta');
      return;
    }

    this.editorService.EstablecerFiltrosValidos();
  }



  addFiltro(): void {
    if (this.selectedProp) {
     const propiedad =  this.propiedes.filter(x => x.Id === this.selectedProp)[0];
     if(propiedad){
       this.index++;
       const propIdBase = propiedad.Id + '-' + this.index.toString();
       const campo: ConfigCampo = {
        Id: propiedad.Id,
        disabled: false,
        label: propiedad.Nombre,
        name: this.CTL_PREFIX + propIdBase,
        options: null,
        placeholder: '',
        type: propiedad.TipoDatoId,
        validation: null,
        value: null,
        selOpCtlId: this.SEL_PREFIX + propIdBase,
        negCheckboxCtlId: this.NEG_PREFIX + propIdBase,
        secondValId: null,
      };


      switch (propiedad.TipoDatoId)
      {
        case tDate:
        case tDateTime:
        case tTime:
        case tInt64:
        case tInt32:
        case tDouble:
          campo.secondValId = this.CTL_PREFIX + propIdBase + this.CTL_SUFIX_2ND;
        break;

        case tList:
          campo.listVal = propiedad.ValoresLista;
        break;
      }

       this.Campos.push(campo);
       this.regenerarForma();
     }
    }
  }


  eliminarFiltros(): void {
    this.editorService.EliminarTodosFiltros();
  }


}
