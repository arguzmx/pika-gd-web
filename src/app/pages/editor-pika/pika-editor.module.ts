import { NgxMaskModule } from 'ngx-mask';
import { NgModule } from '@angular/core';
import { NbPopoverModule, NbInputModule, NbCardModule, NbButtonModule,
  NbActionsModule, NbUserModule, NbCheckboxModule, NbRadioModule, NbDatepickerModule,
  NbSelectModule, NbIconModule, NbFormFieldModule, NbToggleModule } from '@nebular/theme';
import { TableModule } from 'ngx-easy-table';
import { ThemeModule } from '../../@theme/theme.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchFieldsDirective } from './pika-form-search/search-fields/search-fields.directive';
import { PikaEditorComponent } from './pika-editor.component';
import { PikaTableComponent } from './pika-table/pika-table.component';
import { PikaFormSearchComponent } from './pika-form-search/pika-form-search.component';
import { PikaFieldStringComponent } from './pika-form-search/pila-field-string/pila-field-string.component';
import { PikaFieldBoolComponent } from './pika-form-search/pika-field-bool/pika-field-bool.component';
import { PikaFieldDatetimeComponent } from './pika-form-search/pika-field-datetime/pika-field-datetime.component';
import { PikaFieldNumericComponent } from './pika-form-search/pika-field-numeric/pika-field-numeric.component';
import { PikaFieldListComponent } from './pika-form-search/pika-field-list/pika-field-list.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { PikaFormEditComponent } from './pika-form-edit/pika-form-edit.component';
import { PikaListEditorComponent } from './pika-form-edit/pika-list-editor/pika-list-editor.component';
import { PikaNumericEditorComponent } from './pika-form-edit/pika-numeric-editor/pika-numeric-editor.component';
import { PikaStringEditorComponent } from './pika-form-edit/pika-string-editor/pika-string-editor.component';
import { EditFliedsDirective } from './pika-form-edit/edit-field.directive';
import { PikaBoolEditorComponent } from './pika-form-edit/pika-bool-editor/pika-bool-editor.component';
import { PikaDatetimeEditorComponent } from './pika-form-edit/pika-datetime-editor/pika-datetime-editor.component';
import { PikaHiddenEditorComponent } from './pika-form-edit/pika-hidden-editor/pika-hidden-editor.component';
import { NgSelectModule } from '@ng-select/ng-select';

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
  ],
  declarations: [
    SearchFieldsDirective,
    EditFliedsDirective,
    PikaEditorComponent,
    PikaTableComponent,
    PikaFormSearchComponent,
    PikaFieldStringComponent,
    PikaFieldBoolComponent,
    PikaFieldDatetimeComponent,
    PikaFieldNumericComponent,
    PikaFieldListComponent,
    PikaFormEditComponent,
    PikaStringEditorComponent,
    PikaListEditorComponent,
    PikaNumericEditorComponent,
    PikaStringEditorComponent,
    PikaBoolEditorComponent,
    PikaDatetimeEditorComponent,
    PikaHiddenEditorComponent,
  ],
})
export class PikaEditorModule { }
