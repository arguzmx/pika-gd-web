import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FileDropComponent } from './file-drop/file-drop.component';
import { UploadService } from './uploader.service';

@Component({
  selector: 'ngx-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent {
  constructor(public dialog: MatDialog, public uploadService: UploadService) { 
  }

  public openUploadDialog() {
    const dialogRef = this.dialog.open(FileDropComponent, { width: '50%', height: '50%' });
  }
}
