import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfilUsuarioComponent } from './componentes/perfil-usuario/perfil-usuario.component';
import { ConfiguracionAplicacionComponent } from './componentes/configuracion-aplicacion/configuracion-aplicacion.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbProgressBarModule, NbSpinnerModule, NbTooltipModule, NbPopoverModule, NbToggleModule,
  NbInputModule, NbCardModule, NbButtonModule, NbActionsModule, NbUserModule, NbCheckboxModule, NbRadioModule, 
  NbFormFieldModule, NbDatepickerModule, NbSelectModule, NbAccordionModule, NbMenuModule, NbTabsetModule, 
  NbIconModule } from '@nebular/theme';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularSplitModule } from 'angular-split';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TableModule } from 'ngx-easy-table';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { EditorEntidadesModule } from '../@editor-entidades/editor-entidades.module';
import { ThemeModule } from '../@theme/theme.module';



@NgModule({
  declarations: [PerfilUsuarioComponent, ConfiguracionAplicacionComponent],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    EditorEntidadesModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    AngularSplitModule.forRoot(),
    ClipboardModule,
    NbProgressBarModule,
    NgSelectModule,
    NbSpinnerModule,
    NbTooltipModule,
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
    NbDatepickerModule,
    NbSelectModule,
    TableModule,
    NbCardModule,
    ThemeModule,
    FormsModule,
    NbAccordionModule,
    ReactiveFormsModule,
    NbMenuModule,
    RouterModule,
    MatSliderModule,
    NbTabsetModule,
    NgScrollbarModule,
    NbEvaIconsModule, 
    NbIconModule
  ]
})
class ConfiguracionModule { }



 export {ConfiguracionModule, ConfiguracionAplicacionComponent, PerfilUsuarioComponent};