import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Documento } from '../../model/documento';
import { fabric } from 'fabric';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Pagina } from '../../model/pagina';

@Component({
  selector: 'ngx-visor',
  templateUrl: './visor.component.html',
  styleUrls: ['./visor.component.scss'],
})
export class VisorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() documento: Documento;
  canvas: any;
  paginaVisible: Pagina = null;

  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(private servicioVisor: VisorImagenesService) {}

  ngOnInit(): void {
    this.IniciaCanvas();
    this.EscuchaCambiosPagina();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
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

  ZoomIn(event){
    let zoom = this.canvas.getZoom();
    zoom *= 0.999 ** -100;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    this.canvas.zoomToPoint({ x: 500, y: 200 }, zoom);
    event.preventDefault();
    event.stopPropagation();
  }
  ZoomOut(event){
    let zoom = this.canvas.getZoom();
    zoom *= 0.999 ** 100;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    this.canvas.zoomToPoint({ x: 500, y: 200 }, zoom);
    event.preventDefault();
    event.stopPropagation();
  }

  private EscuchaCambiosPagina() {
    this.servicioVisor
      .ObtienePaginaVisible()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((p) => {
        this.paginaVisible = p;
        this.MuestraPaginaVisible();
      });
  }

  private MuestraPaginaVisible() {
    if (this.paginaVisible !== null && this.canvas !== null)

    fabric.Image.fromURL(this.paginaVisible.Url, (img) => {
      this.canvas.clear();
      console.log(this.paginaVisible.Url);
      this.canvas.add(img);
      this.canvas.setDimensions({width: img.width, height: img.height});
    }, {selectable: false});
  }



  private ProcesaDocumento() {
    // console.log(this.documento);
  }
}
