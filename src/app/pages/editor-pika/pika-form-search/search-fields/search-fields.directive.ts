import { PikaFieldListComponent } from './../pika-field-list/pika-field-list.component';
import { PikaFieldNumericComponent } from './../pika-field-numeric/pika-field-numeric.component';

import { Directive, Type, Input, ComponentRef, OnChanges, OnInit,
   ComponentFactoryResolver, ViewContainerRef } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { PikaFieldStringComponent } from '../pila-field-string/pila-field-string.component';
import { FiltroConsulta } from '../../../../@pika/consulta';
import { PikaFieldBoolComponent } from '../pika-field-bool/pika-field-bool.component';
import { PikaFieldDatetimeComponent } from '../pika-field-datetime/pika-field-datetime.component';
import { ConfigCampo } from './config-campo';

const components: {[type: string]: Type<Campo>} = {
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


class FiltroIdentificado extends FiltroConsulta {
  public Id: string;
}

interface Campo {
  config: ConfigCampo;
  group: FormGroup;
}




@Directive({
  selector: '[ngxSearchFields]',
})
class SearchFieldsDirective implements Campo , OnChanges, OnInit {

  @Input()
  config: ConfigCampo;

  @Input()
  group: FormGroup;

  component: ComponentRef<Campo>;

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
    if (!components[this.config.type]) {
      const supportedTypes = Object.keys(components).join(', ');
      throw new Error(
        `Trying to use an unsupported type (${this.config.type}).
        Supported types: ${supportedTypes}`,
      );
    }

    const component = this.resolver.resolveComponentFactory<Campo>(components[this.config.type]);
    this.component = this.container.createComponent(component);
    this.component.instance.config = this.config;
    this.component.instance.group = this.group;
  }

}


export { SearchFieldsDirective, Campo, ConfigCampo, FiltroIdentificado };
