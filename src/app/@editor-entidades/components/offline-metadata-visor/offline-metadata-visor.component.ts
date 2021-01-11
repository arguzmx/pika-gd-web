import { MetadataInfo } from './../../../@pika/metadata/metadata-info';
import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ValorPropiedad } from '../../../@pika/pika-module';


@Component({
  selector: 'ngx-offline-metadata-visor',
  templateUrl: './offline-metadata-visor.component.html',
  styleUrls: ['./offline-metadata-visor.component.scss']
})
export class OfflineMetadataVisorComponent implements OnInit, OnChanges {

  @Output() EventoEliminar = new EventEmitter();
  @Output() EventoEditar = new EventEmitter();

  @Input() registroId: string; 
  @Input() etiqueta: string;
  @Input() metadatos: MetadataInfo;
  @Input() valores: ValorPropiedad[];
  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }


  public propiedadesTabla: ValorPropiedad[] = [];

  ngOnInit(): void {
    this.propiedadesTabla = [];
    const temp : ValorPropiedad[] = [];

    this.metadatos.Propiedades.forEach(p => {
      const contenido = this.valores.find(v=>v.PropiedadId === p.Id);
      const textoValor = contenido !== null ? contenido.Valor : '';
      const valor : ValorPropiedad = {
        PropiedadId: p.Nombre,
        Valor: textoValor
      };
      temp.push(valor);
    });
    this.propiedadesTabla = temp;
  }

  public Editar(event): void {
    event.stopPropagation();
    this.EventoEditar.emit(this.registroId);
  }

  public Eliminar(event): void {
    event.stopPropagation();
    this.EventoEliminar.emit(this.registroId);
  }


}
