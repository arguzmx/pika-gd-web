import { ListSearchComponent } from './../components/metadata-buscador/list-search/list-search.component';
import { BoolSearchComponent } from './../components/metadata-buscador/bool-search/bool-search.component';
import { ConfiguracionEntidad } from './../model/configuracion-entidad';
import { Type, Directive, Input, OnChanges, OnInit, ComponentRef,
  ComponentFactoryResolver, ViewContainerRef, Output, EventEmitter } from '@angular/core';
import { ICampoBuscable } from '../model/i-campo-buscable';
import { FiltroConsulta } from '../../../@pika/consulta';
import { Propiedad } from '../../../@pika/metadata';
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
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
      this.component.instance.propiedad = this.propiedad;
    }
  }

  ngOnInit() {
    let component: any = null;
    if (this.propiedad.AtributoLista) {
      component = this.resolver.resolveComponentFactory<ICampoBuscable>(components['list']);
    } else {
      if (components[this.propiedad.TipoDatoId]) {
        component = this.resolver.resolveComponentFactory<ICampoBuscable>(components[this.propiedad.TipoDatoId]);
      }
    }
    this.creaComponente(component);
  }

  private creaComponente(component: any) {
    if (component) {
      this.component = this.container.createComponent(component);
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
      this.component.instance.propiedad = this.propiedad;
      this.component.instance.EliminarFiltro = this.EliminarFiltro;
      this.component.instance.EstadoFiltro = this.EstadoFiltro;
    }
  }

}



