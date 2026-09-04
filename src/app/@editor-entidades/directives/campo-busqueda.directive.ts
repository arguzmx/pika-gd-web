import { HiddenSearchComponent } from './../components/metadata-buscador/hidden-search/hidden-search.component';
import { ListSearchComponent } from './../components/metadata-buscador/list-search/list-search.component';
import { BoolSearchComponent } from './../components/metadata-buscador/bool-search/bool-search.component';
import { ConfiguracionEntidad } from './../model/configuracion-entidad';
import { Type, Directive, Input, OnChanges, OnInit, ComponentRef,
  ComponentFactoryResolver, ViewContainerRef, Output, EventEmitter } from '@angular/core';
import { ICampoBuscable } from '../model/i-campo-buscable';
import { FiltroConsulta } from '../../@pika/pika-module';
import { Propiedad } from '../../@pika/pika-module';
import { FormGroup } from '@angular/forms';
import { DatetimeSearchComponent } from '../components/metadata-buscador/datetime-search/datetime-search.component';
import { NumericSearchComponent } from '../components/metadata-buscador/numeric-search/numeric-search.component';
import { StringSearchComponent } from '../components/metadata-buscador/string-search/string-search.component';


const components: {[type: string]: Type<ICampoBuscable>} = {
  string: StringSearchComponent,
   bool: BoolSearchComponent,
   double: NumericSearchComponent,
   int: NumericSearchComponent,
   long: NumericSearchComponent,
   datetime: DatetimeSearchComponent,
   date:  DatetimeSearchComponent,
   time:  DatetimeSearchComponent,
   list: ListSearchComponent,
   hidden: HiddenSearchComponent,
};


export class FiltroIdentificado extends FiltroConsulta {
  public Id: string;
}



@Directive({
  selector: '[ngxSearchField]',
})
export class CampoBusquedaDirective implements ICampoBuscable , OnChanges, OnInit {

  @Input()
  propiedad: Propiedad;

  @Input()
  lateral: boolean;

  @Input()
  config: ConfiguracionEntidad;

  @Input()
  group: FormGroup;


  ctl1Id: string;
  ctl2Id: string;
  negCtlId: string;
  opCtlId: string;

  component: ComponentRef<ICampoBuscable>;

  @Output() EstadoFiltro = new EventEmitter();
  @Output() AdicionarFiltro = new EventEmitter();
  @Output() EliminarFiltro = new EventEmitter();

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef,
  ) {
  }



  ngOnChanges() {
    if (this.component) {

      if(this.propiedad.NombreI18n == null) {
        this.propiedad.NombreI18n = this.propiedad.Nombre;
      }
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
      this.component.instance.propiedad = this.propiedad;
      this.component.instance.lateral = this.lateral;
    }
  }

  ngOnInit() {
    let component: any = null;

    if(this.propiedad.NombreI18n == null) {
      this.propiedad.NombreI18n = this.propiedad.Nombre;
    }

    if (this.propiedad.AtributoLista) {
      component = this.resolver.resolveComponentFactory<ICampoBuscable>(components['list']);
    } else {
      let tipocontrol = this.propiedad.TipoDatoId;
      if (components[this.propiedad.TipoDatoId]) {
        if (this.propiedad.Contextual) {
          const v = this.propiedad.AtributosVistaUI.find(x => x.Plataforma === 'web');
          if (v) {
            tipocontrol = v.Control;
          }
        }
        component = this.resolver.resolveComponentFactory<ICampoBuscable>(components[tipocontrol]);
      }
    }
    this.creaComponente(component);
  }

  private creaComponente(component: any) {
    if (component) {
      this.component = this.container.createComponent(component);
      this.component.instance.lateral = this.lateral;
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
      this.component.instance.propiedad = this.propiedad;
      this.component.instance.EliminarFiltro = this.EliminarFiltro;
      this.component.instance.EstadoFiltro = this.EstadoFiltro;
    }
  }

}



