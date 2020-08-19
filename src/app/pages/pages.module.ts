
import { NgModule } from '@angular/core';
import { NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { HostUploaderComponent } from './host-uploader/host-uploader.component';
import { UploaderModule } from '../@uploader/uploader.module';
import { EditorEntidadesModule } from '../@editor-entidades/editor-entidades.module'
@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    UploaderModule,
    EditorEntidadesModule,
  ],
  declarations: [
    PagesComponent,
    HostUploaderComponent,
  ],
})
export class PagesModule {
}
