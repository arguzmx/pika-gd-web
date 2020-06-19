import { Propiedad } from './../../../@pika/metadata/propiedad';
import { PikaHiddenEditorComponent } from './pika-hidden-editor/pika-hidden-editor.component';
import { PikaDatetimeEditorComponent } from './pika-datetime-editor/pika-datetime-editor.component';
import { PikaNumericEditorComponent } from './pika-numeric-editor/pika-numeric-editor.component';
import { Directive, Type, Input, ComponentRef, OnChanges, OnInit,
   ComponentFactoryResolver, ViewContainerRef } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { CampoEditable } from '../model/campo';
import { PikaStringEditorComponent } from './pika-string-editor/pika-string-editor.component';
import { PikaBoolEditorComponent } from './pika-bool-editor/pika-bool-editor.component';
import { PikaListEditorComponent } from './pika-list-editor/pika-list-editor.component';


const components: {[type: string]: Type<CampoEditable>} = {
  textbox: PikaStringEditorComponent,
  toggle: PikaBoolEditorComponent,
  number: PikaNumericEditorComponent,
  datetime: PikaDatetimeEditorComponent,
  select: PikaListEditorComponent,
  hidden: PikaHiddenEditorComponent,
};

@Directive({
  selector: '[ngxEditField]',
})
export class EditFliedsDirective implements CampoEditable , OnChanges, OnInit {

  @Input()
  config: Propiedad;

  @Input()
  group: FormGroup;

  component: ComponentRef<CampoEditable>;

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
    if (components[this.config.ControlHTML]) {
      const component = this.resolver.resolveComponentFactory<CampoEditable>(components[this.config.ControlHTML]);
      this.component = this.container.createComponent(component);
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
    }

  }

}

