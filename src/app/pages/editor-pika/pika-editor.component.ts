import { PikaTableComponent } from './pika-table/pika-table.component';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { FormSearchService } from './pika-form-search/form-search-service';

@Component({
  selector: 'ngx-pika-editor',
  templateUrl: './pika-editor.component.html',
  styleUrls: ['./pika-editor.component.scss'],
  providers: [FormSearchService]
})
export class PikaEditorComponent implements OnInit, OnDestroy {
  @ViewChild(PikaTableComponent)
  private tableComponent: PikaTableComponent;

    constructor(
      private toastrService: NbToastrService,
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

  }


  ngOnDestroy(): void {

  }


}
