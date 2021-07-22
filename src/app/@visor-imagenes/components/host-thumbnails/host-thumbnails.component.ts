import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Documento } from '../../model/documento';
import { VisorImagenesService } from '../../services/visor-imagenes.service';

@Component({
  selector: 'ngx-host-thumbnails',
  templateUrl: './host-thumbnails.component.html',
  styleUrls: ['./host-thumbnails.component.scss'],
})
export class HostThumbnailsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() documento: Documento;
  public cargandoPaginas: boolean = false;
  private onDestroy$: Subject<void> = new Subject<void>();

  @ViewChild("scroller", { static: true })
  public virtualScrollViewport: CdkVirtualScrollViewport;

  constructor(private visorService: VisorImagenesService) {
    this.ListenerPaginas();
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }


  private ListenerPaginas() {
    this.visorService.LeyendoPaginas()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((evento) => {
        this.cargandoPaginas = evento;
        console.log(evento);
        this.virtualScrollViewport.scrollTo({
          bottom: 0,
          behavior: "auto"
        })
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }
  

  ngOnInit(): void {
    this.documento = { Nombre: '', Paginas: [], Id: '', VersionId: '' };
  }
}
