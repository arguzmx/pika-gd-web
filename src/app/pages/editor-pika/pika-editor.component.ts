import { TipoNotifiacion } from './model/notificacion';
import { PikaTableComponent } from './pika-table/pika-table.component';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { EditorService } from './services/editor-service'; 
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'ngx-pika-editor',
  templateUrl: './pika-editor.component.html',
  styleUrls: ['./pika-editor.component.scss'],
  providers: [EditorService,]
})
export class PikaEditorComponent implements OnInit, OnDestroy {
  @ViewChild(PikaTableComponent)
  private tableComponent: PikaTableComponent;
  private onDestroy$: Subject<void> = new Subject<void>();

    constructor(
      private toastrService: NbToastrService,
      private editorService: EditorService,
      ) {

      }


  refrescarTabla() {
    this.tableComponent.refrescarTabla();
  }


  mostrarFiltro() {

  }

  mostrariSelColumna() {
    this.tableComponent.MOstrarColumnas();
  }


  ngOnInit(): void {
    this.ObtieneNotificacionesListener();
  }

  ObtieneNotificacionesListener() {
    this.editorService
      .ObtieneNotificaciones()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((n) => {
        if (n) {
           switch (n.Tipo) {
              case TipoNotifiacion.Advertencia:
                this.toastrService.warning(n.Mensaje);
               break;

               case TipoNotifiacion.Aviso:
                this.toastrService.success(n.Mensaje);
                break;

                case TipoNotifiacion.Error:
                  this.toastrService.danger(n.Mensaje);
               break;

               default:
                this.toastrService.show(n.Mensaje);
               break;
           }
        }
      });
  }


  ngOnDestroy(): void {
    this.onDestroy$.next();
  }


}
