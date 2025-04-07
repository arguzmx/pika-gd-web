import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostListener,
} from "@angular/core";
import { Observable, Subject } from "rxjs";
import { SesionQuery } from "../../../@pika/pika-module";
import { Pagina } from "../../model/pagina";
import { PDFDocumentProxy } from "ng2-pdf-viewer";

@Component({
  selector: "ngx-visor-pdf",
  templateUrl: "./visor-pdf.component.html",
  styleUrls: ["./visor-pdf.component.scss"],
})
export class VisorPdfComponent implements OnInit, OnChanges {
  @Input() pagina: Pagina;

  public url: string = "";
  public bearerToken: string | undefined = undefined;
  public dataUrl$: Observable<any>;
  pdfObject: object = {};
  isPdfLoaded = false;
  pdf: any;
  search: string = '';
  muestraMenu: boolean = true;
  rotation: number = 0;
  defaultZomm: number = 1;
  zoomStep: number = 0.25;
  isDragging: boolean = false;
  pdfZoom: number = this.defaultZomm;
  page: number = 1;
  outline!: any[];
  pdfQuery = '';
  showAll: boolean = false;
  thumbnail = [];
  keyArrowUp: string = "ArrowUp";
  keyArrowDown: string = "ArrowDown";
  keyControl: string = "Control";
  keyCtrl: boolean = false;

  constructor(private sessionQuery: SesionQuery) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.muestraPDF();
  }

  ngOnInit(): void {

    this.bearerToken = "Bearer " + this.sessionQuery.getJWT;
  }

  onLoaded(pdf: PDFDocumentProxy) {
    this.pdf = pdf;
    this.isPdfLoaded = true;
    this.loadOutline();
  }

  loadOutline() {
    this.pdf.getOutline().then((outline: any[]) => {
      this.outline = outline;
    });
  }

  muestraPDF(): void {
    this.pdfObject = {
      url: this.url = this.pagina.Url ? this.pagina.Url : "",
      httpHeaders: { Authorization: "Bearer " + this.sessionQuery.getJWT },
      withCredentials: true
    }
    this.url = this.pagina.Url ? this.pagina.Url : "";
  }

  onDrag(event: MouseEvent, pdfViewer: any): void {
    if (this.isDragging) {
      const x = pdfViewer.element.nativeElement.children[0].scrollLeft - event.movementX;
      const y = pdfViewer.element.nativeElement.children[0].scrollTop - event.movementY;
      console.log(pdfViewer.element.nativeElement.children[0].scrollTop);

      pdfViewer.element.nativeElement.children[0].scrollTo(x, y);
    }
  }

  onDragStarted(event: MouseEvent): void {
    this.isDragging = true;

  }
  onDragEnded(event: MouseEvent, note: 'up' | 'leave'): void {
    this.isDragging = false;
  }

  zoomIn(): void {
    this.pdfZoom += this.zoomStep;
  }

  zoomOut(): void {
    if (this.pdfZoom > this.defaultZomm) {
      this.pdfZoom -= this.zoomStep;
    }
  }

  rotate(angle: number): void {
    if (this.rotation == 360 || this.rotation == -360) {
      this.rotation = 0;
    }
    this.rotation += angle;
  }

  incremetPage(amount: number): void {
    this.page += amount;
    if (this.page < 1) {
      this.page = 1;
    } else if (this.page > this.pdf.numPages) {
      this.page = this.pdf.numPages;
    }
  }

  imprimirPDF() {
    this.pdf.getData().then((u8) => {
      let blob = new Blob([u8.buffer], {
        type: 'application/pdf'
      });
      const blobUrl = window.URL.createObjectURL((blob));
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;

      document.body.appendChild(iframe);
      iframe.contentWindow.print();
    });
  }

  encuentraXPagina(): void {
    this.showAll = !this.showAll;
    this.page = 1;
    this.pdfZoom = 1;
  }

  muestraOpciones(): void {
    this.muestraMenu = !this.muestraMenu;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.keyCtrl = false;
    if (this.pdf.numPages > 1) {
      if (event.key == this.keyArrowDown) {
        this.incremetPage(1);
      } else if (event.key == this.keyArrowUp) {
        this.incremetPage(-1)
      }
    }
    if (event.key == this.keyControl) {
      if (event.type == 'keydown') {
        this.keyCtrl = true;
      }
    }
  }

  @HostListener('document:keyup', ['$event'])
  keyUpEvent(event: KeyboardEvent) {
    if (event.key == this.keyControl) {
      this.keyCtrl = false;
    }
  }

  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    if (this.keyCtrl) {
      event.preventDefault();
    }
  }

  wheelZoom(event: WheelEvent) {
    if (this.keyCtrl) {
      if (event.deltaY < 0) {
        this.zoomIn();
      } else if (event.deltaY > 0) {
        this.zoomOut();
      }
    }

  }
}
