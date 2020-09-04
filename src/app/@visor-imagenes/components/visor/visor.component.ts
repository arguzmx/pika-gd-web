import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Documento } from '../../model/documento';
import { fabric } from 'fabric';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Pagina, OperacionHeader } from '../../model/pagina';

@Component({
  selector: 'ngx-visor',
  templateUrl: './visor.component.html',
  styleUrls: ['./visor.component.scss'],
})
export class VisorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() documento: Documento;
  canvas: any;
  paginaVisible: Pagina = null;
  oImg: any = null;
  muestraZoom: boolean = false;
  loading = false;

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioVisor: VisorImagenesService) {}

  ngOnInit(): void {
    this.IniciaCanvas();
    this.EscuchaCambiosPagina();
    this.EscuchaCambiosHeader();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propiedad in changes) {
      if (changes.hasOwnProperty(propiedad)) {
        switch (propiedad) {
          case 'documento':
            this.ProcesaDocumento();
            break;
        }
      }
    }
  }

  private IniciaCanvas() {
    this.canvas = new fabric.Canvas('canvas');
    const canvas = this.canvas;
    // ====== zoom ======
    this.canvas.on('mouse:wheel', function (opt) {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
    // ===================
    // ====== paneo ======
    this.canvas.on('mouse:down', function(opt) {
      const evt = opt.e;
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    });

    this.canvas.on('mouse:move', function(opt) {
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

    this.canvas.on('mouse:up', function(opt) {
      this.setViewportTransform(this.viewportTransform);
      this.isDragging = false;
      this.selection = true;
    });

    // ==================
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

  private MuestraPaginaVisible() {
    if (this.paginaVisible !== null && this.canvas !== null)
      fabric.Image.fromURL(this.paginaVisible.Url, (img) => {
        this.canvas.clear();
        img.set({ originX:  'middle', originY: 'middle' });
        this.canvas.setDimensions({ width: img.width, height: img.height });
        this.canvas.add(img);
        this.canvas.renderAll();

        this.oImg = img;
        this.loading = false;
      }, {selectable: false});
  }

  private GiraPagina(dir: OperacionHeader) {
    const angulo = this.oImg.angle;

    if (dir === OperacionHeader.GIRAR_DER) this.oImg.angle = angulo + 90;
    if (dir === OperacionHeader.GIRAR_IZQ) this.oImg.angle = angulo - 90;
    if (dir === OperacionHeader.GIRAR_180) this.oImg.angle = angulo + 180;
    this.canvas.renderAll();
  }

  private ReflejaPagina(dir: OperacionHeader) {
    if (dir === OperacionHeader.REFLEJO_HOR) this.oImg.set('flipX', !this.oImg.flipX);
    if (dir === OperacionHeader.REFLEJO_VER) this.oImg.set('flipY', !this.oImg.flipY);
    this.canvas.renderAll();
  }

  private EscuchaCambiosPagina() {
    this.servicioVisor
      .ObtienePaginaVisible()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((p) => {
        this.paginaVisible = p;
        this.loading = p !== null;
        this.MuestraPaginaVisible();
      });
  }

  private EscuchaCambiosHeader() {
    this.servicioVisor
    .ObtieneOperacionHeader()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((op) => {
      switch (op) {
        case OperacionHeader.GIRAR_DER :
        case OperacionHeader.GIRAR_IZQ :
        case OperacionHeader.GIRAR_180 : this.GiraPagina(op); break;
        case OperacionHeader.REFLEJO_HOR :
        case OperacionHeader.REFLEJO_VER : this.ReflejaPagina(op); break;
      }
    });
  }
  
  private ProcesaDocumento() {
    // console.log(this.documento);
  }
}
