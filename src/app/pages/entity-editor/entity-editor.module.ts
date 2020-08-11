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
import { MetadataJerarquiaComponent } from './components/metadata-jerarquia/metadata-jerarquia.component';
import { PasswordEditorComponent } from './components/metadata-editor/password-editor/password-editor.component';
import { EditorArbolEntidadComponent } from "./components/editor-arbol-entidad/editor-arbol-entidad.component";
import {A11yModule} from '@angular/cdk/a11y';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {DragDropModule} from '@angular/cdk//drag-drop';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatBadgeModule} from '@angular/material/badge';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatStepperModule} from '@angular/material/stepper';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';
import {OverlayModule} from '@angular/cdk/overlay';
import { AngularSplitModule } from 'angular-split';
import { CheckboxGroupEditorComponent } from './components/metadata-editor/checkbox-group-editor/checkbox-group-editor.component';
import { HiddenSearchComponent } from './components/metadata-buscador/hidden-search/hidden-search.component';

@NgModule({
  imports: [
    AngularSplitModule.forRoot(),
    A11yModule,
    ClipboardModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    OverlayModule,
    PortalModule,
    ScrollingModule,
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
    MetadataJerarquiaComponent,
    PasswordEditorComponent,
    EditorArbolEntidadComponent,
    CheckboxGroupEditorComponent,
    HiddenSearchComponent,
  ],
})
export class EntityEditorModule {}
