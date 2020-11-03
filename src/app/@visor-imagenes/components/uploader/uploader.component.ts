import { IUploadConfig } from './model/i-upload-config';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FileDropComponent } from './file-drop/file-drop.component';
import { UploadService } from '../../services/uploader.service';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'ngx-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent implements OnInit, OnChanges {
  @Input() accept: string;
  @Input() config: IUploadConfig;
  @Input() maxSize: number; // bytes . 1024 = 1kb . 1048576 b = 1mb . 10485760 b = 10 mb

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(public bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    public uploadService: UploadService,
    public servicioVisor: VisorImagenesService) {}
  ngOnInit(): void {
    this.EscuchaAbrirUpload();
  }

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

  EscuchaAbrirUpload() {
    this.servicioVisor.ObtieneAbrirUpload()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(abrir => {
      if (abrir) {
        this.openUploadSheet();
        this.servicioVisor.EstableceAbrirUpload(false);
       }
    });

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
