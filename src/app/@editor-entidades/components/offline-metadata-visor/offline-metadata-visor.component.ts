import { format, parseISO } from 'date-fns';
import { MetadataInfo } from './../../../@pika/metadata/metadata-info';
import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { tBinaryData, tBoolean, tDate, tDateTime, tDouble, tInt32, tInt64, tList, tString, tTime, ValorPropiedad } from '../../../@pika/pika-module';
import { tIndexedString } from '../../../@pika/metadata';
import { environment } from '../../../../environments/environment';


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
    if(!environment.production){
      console.debug(changes);
    }
  }


  public propiedadesTabla: ValorPropiedad[] = [];

  ngOnInit(): void {
    this.propiedadesTabla = [];
    const temp : ValorPropiedad[] = [];

    this.metadatos.Propiedades.forEach(p => {
      
      p.TipoDatoId
      const contenido = this.valores.find(v=>v.PropiedadId === p.Id);
      const textoValor = this.ObtieneValorPropiedad(contenido, p.TipoDatoId);


      const valor : ValorPropiedad = {
        PropiedadId: p.Nombre,
        Valor: textoValor
      };
      temp.push(valor);
    });
    this.propiedadesTabla = temp;
  }


  private ObtieneValorPropiedad(contenido: ValorPropiedad, tipo: string): string {
    let valor = contenido !== null ? contenido.Valor : '';

    switch (tipo) {
      case tIndexedString:
      case tString:
        break;

      case tDouble:
        break;

      case tBoolean:
        if (valor.toLowerCase() === 'true') {
          valor = 'Verdadero';
        } else {
          valor = 'Falso';
        }
        break;

      case tInt32:
        break;

      case tInt64:
        break;

      case tDateTime:
        if( valor !== ''){
          valor = format( parseISO(valor), 'dd-MM-yyyy HH:mm:ss');
        }
        break;

      case tDate:
        if( valor !== ''){
          valor = format( parseISO(valor), 'dd-MM-yyyy');
        }        
        break;

      case tTime:
        if( valor !== ''){
          valor = format( parseISO(valor), 'HH:mm:ss');
        }
        break;

      case tBinaryData:
        break;

      case tList:
        const prop = this.metadatos.Propiedades.find(p=>p.Id === contenido.PropiedadId);
        const item = prop.AtributoLista.Valores.find( l => l.Id == contenido.Valor);
        if (item) {
          valor = item.Texto
        }
        break;
    }

    return valor;
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
