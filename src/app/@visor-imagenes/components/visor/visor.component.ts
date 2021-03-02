import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ViewChild, 
  Input} from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { fabric } from 'fabric';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { Pagina, OperacionHeader } from '../../model/pagina';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ngx-visor',
  templateUrl: './visor.component.html',
  styleUrls: ['./visor.component.scss'],
})
export class VisorComponent implements OnInit, OnDestroy {
@ViewChild('imgPag') domImg;
@ViewChild('emptyCanvas') emptyCanvas;
@Input() alturaComponente: string;


  canvas: any;
  paginaVisible: Pagina = null;
  oImg: any = null;
  muestraZoom: boolean = false;
  loading = false;
  canvasColor: string = "#000";

  private src$ = new BehaviorSubject('');

  public dataUrl$ : Observable<any>;
  
  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioVisor: VisorImagenesService,
              private httpClient: HttpClient,
              private domSanitizer: DomSanitizer) {}



  ngOnInit(): void {
    this.IniciaCanvas();
    this.EscuchaCambiosPagina();
    this.EscuchaCambiosHeader();

    this.dataUrl$ = this.src$
    .pipe(takeUntil(this.onDestroy$))
    .pipe(
      switchMap(url => {
            return this.cargaImgSegura(url);
          }
       )
    );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  
  private cargaImgSegura(url: string): Observable<any> {
    return this.httpClient
      .get(url, {responseType: 'blob'})
      .pipe(
        map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))));
  }

  imagenCargada($event: any) {
    this.MuestraPaginaVisible();
    this.loading = false;
  }

  private IniciaCanvas() {
    this.canvas = new fabric.Canvas('canvas', {backgroundColor : "#000"});
    
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
    console.log(zoom);
    this.canvas.zoomToPoint({ x: 500, y: 200 }, zoom);
    event.preventDefault();
    event.stopPropagation();
  }

  ZoomOut(event) {
    let zoom = this.canvas.getZoom();
    zoom *= 0.999 ** 100;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    
    console.log(zoom);
    this.canvas.zoomToPoint({ x: 500, y: 200 }, zoom);
    event.preventDefault();
    event.stopPropagation();
  }

  private MuestraPaginaVisible() {
    if (this.paginaVisible.EsImagen && this.canvas !== null) {
      // para cargar la img segura, fue necesario añadirla en un elemento img en el dom
      // debido a que en el método fabric.Image.fromURL el blob da un error 404
      const domImg = this.domImg.nativeElement;
      const instanciaImg = new fabric.Image(domImg, { selectable: false })
                          .set({ originX:  'middle', originY: 'middle' });
      this.oImg = instanciaImg;

      this.canvas.clear();
      this.canvas.setDimensions({ width: instanciaImg.width / 2 , height: instanciaImg.height / 2});
      this.canvas.add(instanciaImg);
      this.canvas.renderAll();
      const ac: number = parseInt( this.alturaComponente.replace('px',''));
      const z = ac/instanciaImg.height;
      console.log(z)
      if(z!=Infinity){
        this.canvas.zoomToPoint({ x: 500, y: 200 }, z * 0.95);
      }
      
      
      // ********************

    } else
        this.canvas.clear();
      // fabric.Image.fromURL(this.paginaVisible.Url, (img) => {
      //   this.canvas.clear();
      //   img.set({ originX:  'middle', originY: 'middle' });
      //   this.canvas.setDimensions({ width: img.width, height: img.height });
      //   this.canvas.add(img);
      //   this.canvas.renderAll();

      //   this.oImg = img;
      //   this.loading = false;
      // }, {selectable: false});
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
        console.log(p);
        if (p) {
          this.loading = true;
          this.src$.next(p.Url);
          this.paginaVisible = p;
        }
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
}

