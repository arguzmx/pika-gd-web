import { FiltroConsultaPropiedad } from './../../@pika/consulta/filtro.-consulta-propiedad';
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
import { FiltroConsulta, FiltroConsultaBackend } from '../../@pika/consulta';
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../editor-entidades.module';
import { first } from 'rxjs/operators';

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

  @Input()
  filtrosQ: FiltroConsultaPropiedad[];

  component: ComponentRef<ICampoEditable>;
  public T: Traductor;

  constructor(
    translate: TranslateService,
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef
  ) {
    this.T = new Traductor(translate);
  }

  ngOnChanges() {
    if (this.component) {
      this.component.instance.propiedad = this.propiedad;
      this.component.instance.group = this.group;
      this.component.instance.isUpdate = this.isUpdate;
      this.component.instance.transaccionId = this.transaccionId;
      this.component.instance.filtrosQ = this.filtrosQ;
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

      if (vista.Control == 'select') {
        const copiaP = {...this.propiedad};

        if(copiaP.AtributoLista.ValoresCSV) {
          copiaP.ValoresLista = [];
          const elementos = this.propiedad.AtributoLista.ValoresCSV.split(',');
          elementos.forEach(e=>{
            if(e.indexOf('|')>0){
              const id = e.split('|')[0];
              const t = e.split('|')[1];
              copiaP.ValoresLista.push({Id: id,Texto: t,Indice: 0});
            } else {
              copiaP.ValoresLista.push({Id: e,Texto: e,Indice: 0});    
            }
          });
        }

        const valores = copiaP.ValoresLista.map(v=> v.Texto);

        this.T.ObtenerTraduccion(valores).pipe(first())
        .subscribe( trads => {
           
            copiaP.ValoresLista.forEach(v=> {
              v.Texto = trads[v.Texto];
            });
            this.component = this.container.createComponent(component);
            this.component.instance.group = this.group;
            this.component.instance.propiedad = copiaP;
            this.component.instance.isUpdate = this.isUpdate;
            this.component.instance.transaccionId = this.transaccionId;
            this.component.instance.filtrosQ = this.filtrosQ;
        });
      } else {
        this.component = this.container.createComponent(component);
        this.component.instance.group = this.group;
        this.component.instance.propiedad = this.propiedad;
        this.component.instance.isUpdate = this.isUpdate;
        this.component.instance.transaccionId = this.transaccionId;
        this.component.instance.filtrosQ = this.filtrosQ;
      }
    }
  }
}
