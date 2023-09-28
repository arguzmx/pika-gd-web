import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppLogService } from '../../../services/app-log/app-log.service';
import { ApiConfiguracion } from '../../services/api-configuracion';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { first } from 'rxjs/operators';
import { ValorListaOrdenada } from '../../../@pika/metadata';

@Component({
  selector: 'ngx-carga-inventario',
  templateUrl: './carga-inventario.component.html',
  styleUrls: ['./carga-inventario.component.scss'],
  providers: [ApiConfiguracion],
})
export class CargaInventarioComponent implements OnInit {
  public T: Traductor;
  blob: any;
  descargando: boolean = false;
  cargaValida: boolean = false;
  fileName = '';
  file: File;
  selectedItem: string = '';
  uas: ValorListaOrdenada[] = [];
  constructor(
    ts: TranslateService,
    private applog: AppLogService,
    private api: ApiConfiguracion) {
    this.T = new Traductor(ts);
  }


  ngOnInit(): void {
    this.CargaTraducciones();
    this.api.ObtieneUAs().pipe(first()).subscribe((uas) => {
      console.log(uas);
      this.uas = uas;
    });
  }


  descarga() {
    if (!this.descargando) {
      this.descargando = true;
      this.api.ObtienePlantillaInventario().pipe(first()).subscribe((data) => {
        this.descargando = false;
        this.blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        var downloadURL = window.URL.createObjectURL(data);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = "plnatilla-importar.xlsx";
        link.click();
      });
    }
  }

  onFileSelected(event) {
    this.file = event.target.files[0];
    if (this.file) {
      if (this.file.name.toUpperCase().indexOf('.XLSX') > 0) {
        this.cargaValida = true;
        this.fileName = this.file.name;
      }
    }
  }


  cargar() {

    if (this.selectedItem != '' && this.cargaValida) {
      const formData = new FormData();
      formData.append("formFile", this.file);
      formData.append("ArchivoId", this.selectedItem);
      formData.append("UnidadAdministrativaId", this.selectedItem);
      formData.append("TipoOrigenId", '-');
      formData.append("OrigenId", '-');
      formData.append("FormatoFecha", 'dd/MM/yyyy');


      this.api.CargaInventario(formData).pipe(first()).subscribe((data) => {
        this.descargando = false;
        this.blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        this.applog.Advertencia('Finalizado','El archivo se ha procesado satisfactoriamente');
        var downloadURL = window.URL.createObjectURL(data);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = "plnatilla-importar-salida.xlsx";
        link.click();
      });
    } else {

      this.applog.Advertencia('Datos incompletos','Debe seleccionar un archivo de excel y la unidad administrativa');
    }
  }


  private CargaTraducciones() {
    // this.T.ts = [
    //   "titulo.carga-inventario"
    // ];
    // this.T.ObtenerTraducciones();
  }
}
