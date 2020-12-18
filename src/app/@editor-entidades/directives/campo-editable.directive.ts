import { PasswordEditorComponent } from './../components/metadata-editor/password-editor/password-editor.component';
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
import { Propiedad } from '../../@pika/pika-module';
import { FormGroup } from '@angular/forms';
import { ICampoEditable } from '../model/i-campo-editable';
import { PLATAFORMA_WEB } from '../../@pika/pika-module';
import { ConfiguracionEntidad } from '../model/configuracion-entidad';
import { StringEditorComponent } from '../components/metadata-editor/string-editor/string-editor.component';
import { BoolEditorComponent } from '../components/metadata-editor/bool-editor/bool-editor.component';
import { NumericEditorComponent } from '../components/metadata-editor/numeric-editor/numeric-editor.component';
import { DatetimeEditorComponent } from '../components/metadata-editor/datetime-editor/datetime-editor.component';
import { ListEditorComponent } from '../components/metadata-editor/list-editor/list-editor.component';
import { HiddenEditorComponent } from '../components/metadata-editor/hidden-editor/hidden-editor.component';
// tslint:disable-next-line: max-line-length
import { CheckboxGroupEditorComponent } from '../components/metadata-editor/checkbox-group-editor/checkbox-group-editor.component';

const components: { [type: string]: Type<ICampoEditable> } = {
  textbox: StringEditorComponent,
  toggle: BoolEditorComponent,
  number: NumericEditorComponent,
  datetime: DatetimeEditorComponent,
  date: DatetimeEditorComponent,
  time: DatetimeEditorComponent,
  select: ListEditorComponent,
  selectmulti: ListEditorComponent,
  hidden: HiddenEditorComponent,
  textarea: StringEditorComponent,
  passconfirm: PasswordEditorComponent,
  checkboxgroupeditor: CheckboxGroupEditorComponent,
};

@Directive({
  selector: '[ngxCampoEditable]',
})
export class CampoEditableDirective
  implements ICampoEditable, OnChanges, OnInit {

  @Input()
  transaccionId: string;

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
      this.component.instance.transaccionId = this.transaccionId;
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
      this.component.instance.group = this.group;
      this.component.instance.propiedad = this.propiedad;
      this.component.instance.isUpdate = this.isUpdate;
      this.component.instance.transaccionId = this.transaccionId;
    }
  }
}
