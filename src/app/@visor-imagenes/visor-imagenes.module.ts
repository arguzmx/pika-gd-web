import { NgModule } from '@angular/core';
import { HostVisorComponent } from './components/host-visor/host-visor.component';
import { ThumbnailComponent } from './components/thumbnail/thumbnail.component';
import { VisorComponent } from './components/visor/visor.component';
import { PieVisorComponent } from './components/pie-visor/pie-visor.component';

import {
  NbTooltipModule,
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
  NbLayoutRulerService,
  NbSpinnerModule,
  NbProgressBarModule,
} from '@nebular/theme';
import { TableModule } from 'ngx-easy-table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ThemeModule } from '../@theme/theme.module';
import { RouterModule } from '@angular/router';
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
import { HostThumbnailsComponent } from './components/host-thumbnails/host-thumbnails.component';
import { HeaderVisorComponent } from './components/header-visor/header-visor.component';
import { UploaderModule } from '../@uploader/uploader.module';
import { VisorTifComponent } from './components/visor-tif/visor-tif.component';
import { VisorPdfComponent } from './components/visor-pdf/visor-pdf.component';
import { VisorAudioComponent } from './components/visor-audio/visor-audio.component';
import { VisorVideoComponent } from './components/visor-video/visor-video.component';
import { VisorOtroComponent } from './components/visor-otro/visor-otro.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MyHttpInterceptor } from './interceptors/my-http.interceptor';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FileDropComponent } from './components/uploader/file-drop/file-drop.component';
import { UploaderComponent } from './components/uploader/uploader.component';
import { ngfModule } from 'angular-file';
import { UploadService } from './services/uploader.service';
import { VisorImagenesService } from './services/visor-imagenes.service';

@NgModule({
  imports: [
    ngfModule,
    NgxExtendedPdfViewerModule,
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
    UploaderModule,
  ],
  declarations: [HostVisorComponent, ThumbnailComponent, VisorComponent,
                PieVisorComponent, HostThumbnailsComponent, HeaderVisorComponent,
                VisorTifComponent, VisorPdfComponent, VisorAudioComponent,
                VisorVideoComponent, VisorOtroComponent,
                UploaderComponent, FileDropComponent],
  exports: [HostVisorComponent, ThumbnailComponent, VisorComponent,
            PieVisorComponent, HostThumbnailsComponent],
  providers: [UploadService, VisorImagenesService, {
    provide: HTTP_INTERCEPTORS, useClass: MyHttpInterceptor, multi: true,
  }],
})
export class VisorImagenesModule { }


