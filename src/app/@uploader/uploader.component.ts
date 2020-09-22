import { IUploadConfig } from './model/i-upload-config';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FileDropComponent } from './file-drop/file-drop.component';
import { UploadService } from './uploader.service';

@Component({
  selector: 'ngx-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent implements OnChanges{
  // tslint:disable-next-line: max-line-length
  constructor(public bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    public uploadService: UploadService) {}

  @Input() accept: string;
  @Input() config: IUploadConfig;
  @Input() maxSize: number; // bytes . 1024 = 1k . 1048576 = 1mb

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'config':
            this.procesaConfiguracion();
            break;
        }
      }
    }
  }

  private procesaConfiguracion() {
    this.uploadService.config = this.config;
  }

  public openUploadDialog() {
    const dialogRef = this.dialog.open(FileDropComponent, {
      width: '50%',
      height: '50%',
      data: { accept: this.accept, maxSize: this.maxSize},
    });
  }

  public openUploadSheet() {
    const bottomSheetRef = this.bottomSheet.open(FileDropComponent, {
      ariaLabel: 'Elegir archivos',
      data: { accept: this.accept, maxSize: this.maxSize},
    });
  }
}
