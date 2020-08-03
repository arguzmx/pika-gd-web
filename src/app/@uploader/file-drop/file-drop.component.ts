import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { UploadService } from '../uploader.service';

@Component({
  selector: 'ngx-file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.scss']
})
export class FileDropComponent implements OnInit {
  @ViewChild('file', { static: false }) file;
  accept = '*';
  files: [] = [];
  progress: any;
  hasBaseDropZoneOver = false;
  httpEmitter: Subscription;
  lastFileAt: Date;
  sendableFormData: FormData;
  dragFiles: any;
  validComboDrag: any;
  lastInvalids: any;
  fileDropDisabled: any;
  maxSize: any;
  baseDropValid: any;

  constructor(
    public dialogRef: MatDialogRef<FileDropComponent>,
    public uploadService: UploadService,
  ) {}

  ngOnInit(): void {}

  cancel() {
    this.progress = 0;
    if (this.httpEmitter) {
      this.httpEmitter.unsubscribe();
    }
  }

  uploadFiles() {
    this.progress = this.uploadService.upload(this.files);
    // console.log(this.progress);
  }

  getDate() {
    return new Date();
  }
}
