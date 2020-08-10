
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
import { NbButtonModule, NbPopoverModule, NbIconModule, NbProgressBarModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';


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
  ],
  declarations: [UploaderComponent, FileDropComponent],
  exports: [UploaderComponent],
  entryComponents: [FileDropComponent],
  providers: [UploadService],
})
export class UploaderModule {}
