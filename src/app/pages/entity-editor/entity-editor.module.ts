import { ListSearchComponent } from './components/metadata-buscador/list-search/list-search.component';
import { DatetimeSearchComponent } from './components/metadata-buscador/datetime-search/datetime-search.component';
import { EntityEditorRoutingModule } from './entity-editor-routing.module';
import { DatetimeEditorComponent } from './components/metadata-editor/datetime-editor/datetime-editor.component';
import { ListEditorComponent } from './components/metadata-editor/list-editor/list-editor.component';
import { NumericEditorComponent } from './components/metadata-editor/numeric-editor/numeric-editor.component';
import { BoolEditorComponent } from './components/metadata-editor/bool-editor/bool-editor.component';
import { StringEditorComponent } from './components/metadata-editor/string-editor/string-editor.component';
import { HiddenEditorComponent } from './components/metadata-editor/hidden-editor/hidden-editor.component';
import { CampoEditableDirective } from './directives/campo-editable.directive';
import { MetadataTablaComponent } from './components/metadata-tabla/metadata-tabla.component';
import { EditorJerarquicoComponent } from './components/editor-jerarquico/editor-jerarquico.component';
import { EditorTabularComponent } from './components/editor-tabular/editor-tabular.component';
import { MetadataBuscadorComponent } from './components/metadata-buscador/metadata-buscador.component';
import { MetadataEditorComponent } from './components/metadata-editor/metadata-editor.component';
import { EntityEditorComponent } from './entity-editor.component';
import { NgxMaskModule } from 'ngx-mask';
import { NgModule } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';

import {
  NbPopoverModule,
  NbInputModule,
  NbCardModule,
  NbButtonModule,
  NbActionsModule,
  NbUserModule,
  NbCheckboxModule,
  NbRadioModule,
  NbDatepickerModule,
  NbSelectModule,
  NbIconModule,
  NbFormFieldModule,
  NbToggleModule,
  NbMenuModule,
} from '@nebular/theme';
import { TableModule } from 'ngx-easy-table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgSelectModule } from '@ng-select/ng-select';
import { ThemeModule } from '../../@theme/theme.module';
import { RouterModule } from '@angular/router';
import { BoolSearchComponent } from './components/metadata-buscador/bool-search/bool-search.component';
import { CampoBusquedaDirective } from './directives/campo-busqueda.directive';
import { NumericSearchComponent } from './components/metadata-buscador/numeric-search/numeric-search.component';
import { StringSearchComponent } from './components/metadata-buscador/string-search/string-search.component';
import { EditorBootTabularComponent } from './components/editor-boot-tabular/editor-boot-tabular.component';
import { EditorBootJerarquicoComponent } from './components/editor-boot-jerarquico/editor-boot-jerarquico.component';

@NgModule({
  imports: [
    NgSelectModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgxMaskModule.forRoot(),
    NbPopoverModule,
    NbToggleModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbActionsModule,
    NbUserModule,
    NbCheckboxModule,
    NbRadioModule,
    NbFormFieldModule,
    NbIconModule,
    NbDatepickerModule,
    NbSelectModule,
    NbIconModule,
    TableModule,
    NbCardModule,
    ThemeModule,
    FormsModule,
    ReactiveFormsModule,
    NbMenuModule,
    RouterModule,
    MatSliderModule,
  ],
  declarations: [
    EditorJerarquicoComponent,
    EditorTabularComponent,
    MetadataBuscadorComponent,
    MetadataEditorComponent,
    MetadataTablaComponent,
    EntityEditorComponent,
    CampoEditableDirective,
    HiddenEditorComponent,
    StringEditorComponent,
    BoolEditorComponent,
    NumericEditorComponent,
    ListEditorComponent,
    DatetimeEditorComponent,
    CampoBusquedaDirective,
    BoolSearchComponent,
    DatetimeSearchComponent,
    ListSearchComponent,
    NumericSearchComponent,
    StringSearchComponent,
    EditorBootTabularComponent,
    EditorBootJerarquicoComponent,
  ],
})
export class EntityEditorModule {}
