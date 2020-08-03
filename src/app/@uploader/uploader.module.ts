import { NgModule } from '@angular/core';
import { UploaderComponent } from './uploader.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UploadService } from './uploader.service';
import { ngfModule } from 'angular-file';
import { FileDropComponent } from './file-drop/file-drop.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatListModule,
    MatProgressBarModule,
    ngfModule,
  ],
  declarations: [UploaderComponent, FileDropComponent],
  exports: [UploaderComponent],
  entryComponents: [FileDropComponent],
  providers: [UploadService],
})
export class UploaderModule { }
