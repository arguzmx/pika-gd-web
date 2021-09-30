import { first } from 'rxjs/operators';
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MetadataInfo, ValorListaOrdenada } from '../../../@pika/metadata';
import { AppLogService } from '../../../@pika/servicios';
import { Traductor } from '../../editor-entidades.module';
import { EntidadesService } from '../../services/entidades.service';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-editor-temas-seleccion',
  templateUrl: './editor-temas-seleccion.component.html',
  styleUrls: ['./editor-temas-seleccion.component.scss']
})
export class EditorTemasSeleccionComponent implements OnInit, AfterViewInit {

  public temas: ValorListaOrdenada[] = [];
  public T: Traductor;
  private id: string;
  nuevoTema: string = '';
  @Input() metadata: MetadataInfo;
  @Input() entidades: EntidadesService;

  constructor(
    protected ref: NbDialogRef<EditorTemasSeleccionComponent>,
    ts: TranslateService,
  ) { 
    this.T = new Traductor(ts);
  }

  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    this.CargaTraducciones();
    this.ObtieneTemas();
  }


  private ObtieneTemas() {
    this.temas = [];
    this.entidades.TemaSeleccionObtener(this.metadata.Tipo).pipe(first())
    .subscribe( resultado => {
      this.temas = resultado;
    }, (err)=> {});
  }

  private CargaTraducciones() {
    this.T.ts = ['entidades.temas-seleccion-nombre', 'ui.crear',
  'ui.cancelar', 'ui.aceptar', 'entidades.temas-seleccion'];
    this.T.ObtenerTraducciones();
  }

  public cambioSeleccion($event) {
    this.id= $event;
  }

  SelecionarTema() {
    if (this.id) {
      this.ref.close(this.id);
    } 
  }

  public cerrar() {
    this.ref.close(null);
  }

  public crearTema() {
    if(this.nuevoTema) {
      this.entidades.TemaSeleccionAdicionar(this.nuevoTema, this.metadata.Tipo)
      .subscribe(seleccion=> {
        if (seleccion) {
          this.temas = seleccion;
        }
      }, (err)=>{})
    }
  }

}
