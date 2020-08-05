import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UploadService } from '../uploader.service';

@Component({
  selector: 'ngx-file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.scss'],
})
export class FileDropComponent implements OnInit {
  @ViewChild('file', { static: false }) file;

  constructor(
    public dialogRef: MatDialogRef<FileDropComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public uploadService: UploadService) {
    this.accept = data.accept;
    this.maxSize = data.maxSize;
  }

  accept: string;
  maxSize: number;
  files: any[] = [];
  progress: any;
  hasBaseDropZoneOver = false;
  httpEmitter: Subscription;
  lastFileAt: Date;
  sendableFormData: FormData;
  dragFiles: any;
  validComboDrag: any;
  lastInvalids: any;
  fileDropDisabled: any;
  baseDropValid: any;

  ngOnInit(): void {}

  cancel() {
    this.progress = 0;
    if (this.httpEmitter) {
      this.httpEmitter.unsubscribe();
    }
  }

  uploadFiles() {
    this.progress = this.uploadService.upload(this.files);
    console.log(this.progress);
  }

  getDate() {
    return new Date();
  }
}
