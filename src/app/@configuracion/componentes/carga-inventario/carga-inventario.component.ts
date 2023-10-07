import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppLogService } from '../../../services/app-log/app-log.service';
import { ApiConfiguracion } from '../../services/api-configuracion';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { first } from 'rxjs/operators';
import { ValorListaOrdenada } from '../../../@pika/metadata';
import { RespuestaImportacion } from '../../model/respuesta-importar';

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
  selectedItemA: string = '';
  uas: ValorListaOrdenada[] = [];
  archivos: ValorListaOrdenada[] = [];
  importado: boolean = false;
  descargable = false;
  respuesta: RespuestaImportacion = { Archivo: "",
    Error: "",
    FechaInicio: null,
    FechaFin: null,
    Total: 0,
    Ok: 0,
    Erroneos: 0
  };

  constructor(
    ts: TranslateService,
    private applog: AppLogService,
    private api: ApiConfiguracion) {
    this.T = new Traductor(ts);
  }


  ngOnInit(): void {
    this.CargaTraducciones();
    this.api.ObtieneUAs().pipe(first()).subscribe((uas) => {
      this.uas = uas;
    });
  }

  uaSelected($event) {
    this.archivos = [];
    this.selectedItemA = '';
    this.api.ObtieneArchivos($event).pipe(first()).subscribe((archivos) => {
      this.archivos = archivos;
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

    if (this.selectedItem != '' && this.selectedItemA != '' && this.cargaValida) {

      this.importado = false;
      this.descargable = false;

      const formData = new FormData();
      formData.append("formFile", this.file);
      formData.append("ArchivoId", this.selectedItemA);
      formData.append("UnidadAdministrativaId", this.selectedItem);
      formData.append("TipoOrigenId", '-');
      formData.append("OrigenId", '-');
      formData.append("FormatoFecha", 'dd/MM/yyyy');


      this.api.CargaInventario(formData).pipe(first()).subscribe((data) => {
        this.descargando = false;
        this.importado = true;
        this.respuesta = data;
        if(data.Archivo!="") {
          this.descargable = true;
        }
        this.applog.Advertencia('Finalizado','El archivo se ha procesado satisfactoriamente');
      }, ()=> {
        this.applog.Falla('Error','Ocurrió un error al cargar el archivo intente más tarde');
      });
    } else {

      this.applog.Advertencia('Datos incompletos','Debe seleccionar un archivo de excel, la unidad administrativa y su archivo destino');
    }
  }

  private DescargaInventario() {
    this.api.DescargaInventario(this.respuesta.Archivo).pipe(first()).subscribe((data) => {
      this.descargando = false;
      this.blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      var downloadURL = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = "plnatilla-importar-salida.xlsx";
      link.click();
    });
  }

  private CargaTraducciones() {
    // this.T.ts = [
    //   "titulo.carga-inventario"
    // ];
    // this.T.ObtenerTraducciones();
  }
}
