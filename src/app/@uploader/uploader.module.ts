
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ngfModule } from 'angular-file';
import { UploaderComponent } from './uploader.component';
import { UploadService } from './uploader.service';
import { FileDropComponent } from './file-drop/file-drop.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { NbButtonModule, NbPopoverModule, NbIconModule, NbProgressBarModule, NbTooltipModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { IUploadConfig } from './model/i-upload-config';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  imports: [
    CommonModule,
    NbButtonModule,
    NbIconModule,
    NbEvaIconsModule,
    NbProgressBarModule,
    NbPopoverModule,
    MatButtonModule,
    MatDialogModule,
    MatBottomSheetModule,
    MatListModule,
    MatProgressBarModule,
    ngfModule,
    NbTooltipModule,
    MatIconModule,
  ],
  declarations: [UploaderComponent, FileDropComponent],
  exports: [UploaderComponent],
  entryComponents: [FileDropComponent],
  providers: [UploadService],
})
class UploaderModule {}

export { UploaderModule, IUploadConfig };

