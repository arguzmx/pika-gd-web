import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { Subscription } from "rxjs";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { UploadService } from "../uploader.service";
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from "@angular/material/bottom-sheet";
import { forkJoin } from "rxjs";

@Component({
  selector: "ngx-file-drop",
  templateUrl: "./file-drop.component.html",
  styleUrls: ["./file-drop.component.scss"],
})
export class FileDropComponent implements OnInit {
  @ViewChild("file", { static: false }) file;

  constructor(
    public uploadService: UploadService,
    public bottomSheetRef: MatBottomSheetRef<FileDropComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {
    this.accept = data.accept;
    this.maxSize = data.maxSize;
  }
  //#region drag zone variables
  accept: string;
  maxSize: number;
  files: any[] = [];
  selectable = false;
  hasBaseDropZoneOver = false;
  httpEmitter: Subscription;
  lastFileAt: Date;
  sendableFormData: FormData;
  dragFiles: any;
  validComboDrag: any;
  lastInvalids: any;
  fileDropDisabled: any;
  baseDropValid: any;
  //#endregion

  //#region upload variables
  progress: any;
  uploadSuccessful = false;
  uploading = false;
  //#endregion

  ngOnInit(): void {}

  cancel() {
    this.progress = 0;
    if (this.httpEmitter) {
      this.httpEmitter.unsubscribe();
    }
  }

  uploadFiles() {
    this.progress = this.uploadService.upload(this.files);

    // tslint:disable-next-line: forin
    for (const key in this.progress) {
      this.progress[key].progress.subscribe((val) => console.log(val));
    }

    // convert the progress map into an array
    const allProgressObservables = [];
    // tslint:disable-next-line: forin
    for (const key in this.progress) {
      allProgressObservables.push(this.progress[key].progress);
    }
    // The bottomSheet should not be closed while uploading
    this.bottomSheetRef.disableClose = true;

    forkJoin(allProgressObservables).subscribe((end) => {
      // ... the dialog can be closed now...
      this.bottomSheetRef.disableClose = false;
      // ... the upload was successful...
      this.uploadSuccessful = true;
      // ... and the component is no longer uploading
      this.uploading = false;
    });
  }

  getDate() {
    return new Date();
  }
}