import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FileDropComponent } from './file-drop/file-drop.component';
import { UploadService } from './uploader.service';

@Component({
  selector: 'ngx-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent {
  constructor(public dialog: MatDialog, public uploadService: UploadService) {}
  @Input() accept: string;
  @Input() maxSize: number; // bytes . 1024 = 1k . 1048576 = 1mb

  public openUploadDialog() {
    const dialogRef = this.dialog.open(FileDropComponent, {
      width: '50%',
      height: '50%',
      data: { accept: this.accept, maxSize: this.maxSize},
    });
  }
}
