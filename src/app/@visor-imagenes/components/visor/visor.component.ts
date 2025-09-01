import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  AfterViewInit,
} from "@angular/core";
import { VisorImagenesService } from "../../services/visor-imagenes.service";
import { fabric } from "fabric";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map, switchMap, takeUntil } from "rxjs/operators";
import { Pagina, OperacionHeader } from "../../model/pagina";
import { DomSanitizer } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "ngx-visor",
  templateUrl: "./visor.component.html",
  styleUrls: ["./visor.component.scss"],
})
export class VisorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("imgPag") domImg;
  @ViewChild("emptyCanvas") emptyCanvas;
  @ViewChild("contenedorImg") contenedorImg;
  @Input() alturaComponente: string;

  canvasId = "canvas" + new Date().getMilliseconds().toString();
  canvas: any;
  paginaVisible: Pagina = null;
  oImg: any = null;
  muestraZoom: boolean = false;
  loading = false;
  canvasColor: string = "#000";
  esImagen: boolean = false;
  private srcImg: string = "";

  private src$ = new BehaviorSubject("");

  public dataUrl$: Observable<any>;

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(
    private servicioVisor: VisorImagenesService,
    private httpClient: HttpClient,
    private domSanitizer: DomSanitizer
  ) { }

  ngAfterViewInit(): void {
    this.IniciaCanvas();
    this.CanvasInicial();
  }

  ngOnInit(): void {
    this.EscuchaCambiosPagina();
    this.EscuchaCambiosHeader();

    this.dataUrl$ = this.src$.pipe(takeUntil(this.onDestroy$)).pipe(
      switchMap((url) => {
        return this.cargaImgSegura(url);
      })
    );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  private cargaImgSegura(url: string): Observable<any> {
    if (this.esImagen) {
      if (this.srcImg != url) this.srcImg = url;
    } else {
      this.srcImg = "";
      url = "";
    }

    return this.httpClient
      .get(url, { responseType: "blob" })
      .pipe(
        map((e) =>
          this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))
        )
      );
  }

  imagenCargada($event: any) {
    this.MuestraPaginaVisible();
    this.loading = false;
  }

  private IniciaCanvas() {
    this.canvas = new fabric.Canvas(this.canvasId, { backgroundColor: "#000" });

    //const canvas = this.canvas;

    // ====== zoom ======
    this.canvas.on("mouse:wheel", function (opt) {
      const delta = opt.e.deltaY;
      try {
        let zoom = this.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      } catch (error) {
        // console.error(error);
      }
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // ====== paneo ======
    this.canvas.on("mouse:down", function (opt) {
      const evt = opt.e;
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    });

    this.canvas.on("mouse:move", function (opt) {
      if (this.isDragging) {
        const e = opt.e;
        const vpt = this.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });

    this.canvas.on("mouse:up", function (opt) {
      this.setViewportTransform(this.viewportTransform);
      this.isDragging = false;
      this.selection = true;
    });
  }

  ZoomIn(event) {
    let zoom = this.canvas.getZoom();
    zoom *= 0.999 ** -100;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;

    this.canvas.zoomToPoint({ x: 500, y: 200 }, zoom);
    event.preventDefault();
    event.stopPropagation();
  }

  ZoomOut(event) {
    let zoom = this.canvas.getZoom();
    zoom *= 0.999 ** 100;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;

    this.canvas.zoomToPoint({ x: 500, y: 200 }, zoom);
    event.preventDefault();
    event.stopPropagation();
  }

  private AlturaCanvas(): number {
    return parseInt(this.alturaComponente.replace("px", "")) - 50;
  }

  private AlturaCanvasPx(): string {
    return this.AlturaCanvas().toString() + "px";
  }

  private CanvasInicial() {
    const anchura =
      parseInt(this.contenedorImg.nativeElement.clientWidth) - 100;
    this.canvas.clear();
    this.canvas.setDimensions({ width: anchura, height: this.AlturaCanvas() });
  }

  private MuestraPaginaVisible() {
    if (this.paginaVisible.EsImagen && this.canvas !== null) {
      const anchura = parseInt(this.contenedorImg.nativeElement.clientWidth);

      // para cargar la img segura, fue necesario añadirla en un elemento img en el dom
      // debido a que en el método fabric.Image.fromURL el blob da un error 404
      const domImg = this.domImg.nativeElement;
      const instanciaImg = new fabric.Image(domImg, { selectable: false }).set({
        originX: "middle",
        originY: "middle",
      });

      this.oImg = instanciaImg;
      this.canvas.clear();
      this.canvas.setDimensions({
        width: anchura,
        height: this.AlturaCanvas(),
      });
      this.canvas.add(instanciaImg);
      this.canvas.renderAll();

      var z: number = 1;

      if (instanciaImg.width > instanciaImg.height) {
        z = anchura / instanciaImg.width;
      } else {
        z = this.AlturaCanvas() / instanciaImg.height;
      }

      if (z != Infinity) {
        this.canvas.zoomToPoint({ x: 0, y: 0 }, z * 0.95);
        this.canvas.viewportCenterObject(instanciaImg);
      }
    } else {
      this.canvas.clear();
    }
  }

  private GiraPagina(dir: OperacionHeader) {
    const angulo = this.oImg.angle;
    if (dir === OperacionHeader.GIRAR_DER) this.oImg.angle = angulo + 90;
    if (dir === OperacionHeader.GIRAR_IZQ) this.oImg.angle = angulo - 90;
    if (dir === OperacionHeader.GIRAR_180) this.oImg.angle = angulo + 180;

    this.canvas.renderAll();
  }

  private ReflejaPagina(dir: OperacionHeader) {
    if (dir === OperacionHeader.REFLEJO_HOR)
      this.oImg.set("flipX", !this.oImg.flipX);
    if (dir === OperacionHeader.REFLEJO_VER)
      this.oImg.set("flipY", !this.oImg.flipY);
    this.canvas.renderAll();
  }

  private EscuchaCambiosPagina() {
    this.servicioVisor
      .ObtienePaginaVisible()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((p) => {
        if (p) {
          this.esImagen = p.EsImagen;
          this.loading = true;
          try {
            this.src$.next(p.Url);
            this.paginaVisible = p;
            this.loading = false;
          } catch (error) {
            console.error('Error al obtener la página visible:', error);
            this.loading = true;
          } 
        }
      });
  }

  private EscuchaCambiosHeader() {
    this.servicioVisor
      .ObtieneOperacionHeader()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((op) => {
        if (op) {
          this.src$.next(`${this.srcImg}?${Date.now()}`);
        }

        // if (this.oImg ) {
        //   switch (op) {
        //     case OperacionHeader.GIRAR_DER :
        //     case OperacionHeader.GIRAR_IZQ :
        //     case OperacionHeader.GIRAR_180 : this.GiraPagina(op); break;
        //     case OperacionHeader.REFLEJO_HOR :
        //     case OperacionHeader.REFLEJO_VER : this.ReflejaPagina(op); break;
        //   }
        // }
      });
  }

}
