import { NgxMaskModule } from 'ngx-mask';
import { NgModule } from '@angular/core';
import { NbPopoverModule, NbInputModule, NbCardModule, NbButtonModule,
  NbActionsModule, NbUserModule, NbCheckboxModule, NbRadioModule, NbDatepickerModule,
  NbSelectModule, NbIconModule, NbFormFieldModule } from '@nebular/theme';
import { FormsRoutingModule } from '../forms/forms-routing.module';
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

@NgModule({
  imports: [
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgxMaskModule.forRoot(),
    NbPopoverModule,
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
    FormsRoutingModule,
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
    PikaEditorComponent,
    PikaTableComponent,
    PikaFormSearchComponent,
    PikaFieldStringComponent,
    PikaFieldBoolComponent,
    PikaFieldDatetimeComponent,
    PikaFieldNumericComponent,
    PikaFieldListComponent,
  ],
})
export class PikaEditorModule { }
