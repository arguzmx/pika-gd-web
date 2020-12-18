import { DialogMetadataComponent } from './../dialog-metadata/dialog-metadata.component';
import { first } from 'rxjs/operators';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NbDialogService, NbSelectComponent } from '@nebular/theme';
import { DocumentosService } from '../../services/documentos.service';

@Component({
  selector: 'ngx-editor-plantilla',
  templateUrl: './editor-plantilla.component.html',
  styleUrls: ['./editor-plantilla.component.scss']
})
export class EditorPlantillaComponent implements OnInit, AfterViewInit {

  public plantillas: any[] = [];
  public editorVisible: boolean = false;
  @ViewChild('listaplantilla') listaplantilla: NbSelectComponent;


  constructor(private  servicioPlantilla: DocumentosService,
    private dialogService: NbDialogService) {


    }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.ObtienePlantillas();
  }


  private ObtienePlantillas(): void {
    this.servicioPlantilla.ObtienePlantillas().pipe(first())
    .subscribe( (data) => {
      this.plantillas = data;
      console.info(data);
    }, (e) => {}, () => {});
  }


  public EditorPlantillaUnico(): void {
    this.dialogService.open(
      DialogMetadataComponent,
      {
        closeOnBackdropClick: false,
        closeOnEsc: false,
        hasScroll: true,
         context: { data: this.listaplantilla.selected},
      });

    // this.servicioPlantilla.ObtieneMetadataInfo(this.listaplantilla.selected)
    // .pipe(first())
    // .subscribe( (data) => {
    //   console.info(data);
    // }, (e) => {}, () => {});
  }

  public EditorPlantillaLista(): void {

  }

  public opChange(event): void {
    console.info(event);
  }

}
