import { busquedaContenidoModule } from './../@busqueda-contenido/busqueda-contenido.module';
import { NgModule } from '@angular/core';
import { NbButtonModule, NbCardModule, NbMenuModule } from '@nebular/theme';
import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { EditorEntidadesModule } from '../@editor-entidades/editor-entidades.module';
import { GestorPermisosModule } from '../@gestor-permisos/gestor-permisos.module';
import { HostVisorContenidoComponent } from './host-visor-contenido/host-visor-contenido.component';
import { VisorImagenesModule } from '../@visor-imagenes/visor-imagenes.module';
import { SinAccesoComponent } from './comunes/sin-acceso/sin-acceso.component';
import { InicioComponent } from './comunes/inicio/inicio.component';
import { DesconocidoComponent } from './comunes/desconocido/desconocido.component';
import { HostBusquedaContenidoComponent } from './host-busqueda-contenido/host-busqueda-contenido.component';
import { ConfiguracionModule } from '../@configuracion/configuracion.module';

@NgModule({
  imports: [
    VisorImagenesModule,
    busquedaContenidoModule,
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    NbCardModule,
    NbButtonModule,
    EditorEntidadesModule,
    GestorPermisosModule,
    ConfiguracionModule
  ],
  declarations: [
    PagesComponent,
    HostVisorContenidoComponent,
    SinAccesoComponent,
    InicioComponent,
    DesconocidoComponent,
    HostBusquedaContenidoComponent,
  ],
})
export class PagesModule {
}
