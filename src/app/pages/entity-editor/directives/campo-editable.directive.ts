import {
  Directive,
  Input,
  ComponentRef,
  ComponentFactoryResolver,
  ViewContainerRef,
  OnChanges,
  OnInit,
  Type,
} from '@angular/core';
import { Propiedad } from '../../../@pika/metadata';
import { FormGroup } from '@angular/forms';
import { ICampoEditable } from '../model/i-campo-editable';
import { PLATAFORMA_WEB } from '../../../@pika/metadata/atributos-vista-ui';
import { ConfiguracionEntidad } from '../model/configuracion-entidad';
import { StringEditorComponent } from '../components/metadata-editor/string-editor/string-editor.component';
import { BoolEditorComponent } from '../components/metadata-editor/bool-editor/bool-editor.component';
import { NumericEditorComponent } from '../components/metadata-editor/numeric-editor/numeric-editor.component';
import { DatetimeEditorComponent } from '../components/metadata-editor/datetime-editor/datetime-editor.component';
import { ListEditorComponent } from '../components/metadata-editor/list-editor/list-editor.component';
import { HiddenEditorComponent } from '../components/metadata-editor/hidden-editor/hidden-editor.component';

const components: { [type: string]: Type<ICampoEditable> } = {
  textbox: StringEditorComponent,
  toggle: BoolEditorComponent,
  number: NumericEditorComponent,
  datetime: DatetimeEditorComponent,
  select: ListEditorComponent,
  hidden: HiddenEditorComponent,
  textarea: StringEditorComponent,
};

@Directive({
  selector: '[ngxCampoEditable]',
})
export class CampoEditableDirective
  implements ICampoEditable, OnChanges, OnInit {

  @Input()
  propiedad: Propiedad;

  @Input()
  group: FormGroup;

  @Input()
  isUpdate: boolean;

  @Input()
  congiguracion: ConfiguracionEntidad;

  component: ComponentRef<ICampoEditable>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef,
  ) {}


  ngOnChanges() {
    if (this.component) {
      this.component.instance.propiedad = this.propiedad;
      this.component.instance.group = this.group;
      this.component.instance.isUpdate = this.isUpdate;
      this.component.instance.congiguracion = this.congiguracion;
    }
  }

  ngOnInit() {
    const vista = this.propiedad.AtributosVistaUI.find(
      (x) => (x.Plataforma === PLATAFORMA_WEB),
    );
    if (vista && components[vista.Control]) {
      const component = this.resolver.resolveComponentFactory<ICampoEditable>(
        components[vista.Control],
      );
      this.component = this.container.createComponent(component);
      this.component.instance.congiguracion = this.congiguracion;
      this.component.instance.group = this.group;
      this.component.instance.propiedad = this.propiedad;
      this.component.instance.isUpdate = this.isUpdate;
    }
  }
}
