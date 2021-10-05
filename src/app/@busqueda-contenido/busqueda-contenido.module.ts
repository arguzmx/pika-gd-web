import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbProgressBarModule, NbSpinnerModule, NbTooltipModule, NbPopoverModule, NbToggleModule, NbInputModule, NbCardModule, NbButtonModule, NbActionsModule, NbUserModule, NbCheckboxModule, NbRadioModule, NbFormFieldModule, NbDatepickerModule, NbSelectModule, NbAccordionModule, NbMenuModule, NbTabsetModule, NbIconModule } from '@nebular/theme';
import { NgSelectModule } from '@ng-select/ng-select';
import { TableModule } from 'ngx-easy-table';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ThemeModule } from '../@theme/theme.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BusquedaInterceptor } from './services/busqueda-interceptor';
import { CacheEntidadesService, EditorEntidadesModule } from '../@editor-entidades/editor-entidades.module';
import { HostBusquedaComponent } from './componentes/host-busqueda/host-busqueda.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BMetadatosComponent } from './componentes/b-metadatos/b-metadatos.component';
import { BPropiedadesComponent } from './componentes/b-propiedades/b-propiedades.component';
import { BTextoComponent } from './componentes/b-texto/b-texto.component';
import { BCarpetaComponent } from './componentes/b-carpeta/b-carpeta.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BusquedaContenido } from './model/busqueda-contenido';
import { HighlightHit } from './model/highlight-hit';

@NgModule({
  declarations: [HostBusquedaComponent, BMetadatosComponent, BPropiedadesComponent, BTextoComponent, BCarpetaComponent],
  imports: [
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
  ],
  exports: [HostBusquedaComponent],
  providers: [CacheEntidadesService,
    {
   provide: HTTP_INTERCEPTORS, useClass: BusquedaInterceptor, multi: true,
 }],
})
class busquedaContenidoModule { }


 export {busquedaContenidoModule, BusquedaContenido, HighlightHit};