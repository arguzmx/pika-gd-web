import { Propiedad } from './../../../../@pika/metadata/propiedad';
import { PikaFieldListComponent } from './../pika-field-list/pika-field-list.component';
import { PikaFieldNumericComponent } from './../pika-field-numeric/pika-field-numeric.component';

import { Directive, Type, Input, ComponentRef, OnChanges, OnInit,
   ComponentFactoryResolver, ViewContainerRef } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { PikaFieldStringComponent } from '../pila-field-string/pila-field-string.component';
import { FiltroConsulta } from '../../../../@pika/consulta';
import { PikaFieldBoolComponent } from '../pika-field-bool/pika-field-bool.component';
import { PikaFieldDatetimeComponent } from '../pika-field-datetime/pika-field-datetime.component';
import { CampoBuscable } from '../../model/campo';

const components: {[type: string]: Type<CampoBuscable>} = {
  string: PikaFieldStringComponent,
  bool: PikaFieldBoolComponent,
  double: PikaFieldNumericComponent,
  int: PikaFieldNumericComponent,
  long: PikaFieldNumericComponent,
  datetime: PikaFieldDatetimeComponent,
  date:  PikaFieldDatetimeComponent,
  time:  PikaFieldDatetimeComponent,
  list: PikaFieldListComponent,
};


export class FiltroIdentificado extends FiltroConsulta {
  public Id: string;
}



@Directive({
  selector: '[ngxSearchFields]',
})
export class SearchFieldsDirective implements CampoBuscable , OnChanges, OnInit {

  @Input()
  config: Propiedad;

  @Input()
  group: FormGroup;

  ctl1Id: string;
  ctl2Id: string;
  negCtlId: string;
  opCtlId: string;

  component: ComponentRef<CampoBuscable>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef,
  ) {
  }


  ngOnChanges() {
    if (this.component) {
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
    }
  }

  ngOnInit() {
    if (components[this.config.TipoDatoId]) {
      const component = this.resolver.resolveComponentFactory<CampoBuscable>(components[this.config.TipoDatoId]);
      this.component = this.container.createComponent(component);
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
    }
  }

}



