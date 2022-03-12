import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FiltroConsulta, MetadataInfo, Operacion } from '../../../@pika/pika-module';
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/services/traductor';
import { AppLogService } from '../../../services/app-log/app-log.service';

@Component({
  selector: 'ngx-b-texto',
  templateUrl: './b-texto.component.html',
  styleUrls: ['./b-texto.component.scss']
})
export class BTextoComponent implements OnInit, AfterViewInit {

  lateral: boolean = true;
  metadata: MetadataInfo;
  formOCR: FormGroup;

  // Especifica si la entidad tiene eliminar logico
  public eliminarLogico: boolean = false;

  public T: Traductor;

  constructor(private ts: TranslateService, private applog: AppLogService, private fb: FormBuilder,) {
    this.T = new Traductor(ts);
    this.IniciaFormOCR();
  }


  private CargaTraducciones() {
    this.T.ts = ['busqueda.phocr', 'busqueda.fuzzy',
    , 'busqueda.fuzzy-exacta', , 'busqueda.fuzzy-alta', 
    , 'busqueda.fuzzy-media', 'busqueda.fuzzy-baja', 'busqueda.fuzzy-similar'];
    this.T.ObtenerTraducciones();
  }

  ngAfterViewInit(): void {
    
  }

  IniciaFormOCR () {
    this.formOCR = new FormGroup({
      texto: new FormControl(),
      fuzzy: new FormControl()
    });
    this.formOCR.get("fuzzy").setValue('1');
  }

  ngOnInit(): void {
    // this.formOCR.valueChanges
    // .subscribe( campos => {
    //   console.debug(campos);
    // });
    this.CargaTraducciones();
  }


  public Filtros(): FiltroConsulta[] {
    const filtros: FiltroConsulta[] = [];
    const texto = this.formOCR.get('texto').value;
    const fuzzy = this.formOCR.get('fuzzy').value;
    if (texto) {
      filtros.push( { Id : 'OCR', Negacion : false, Propiedad: "texto",
                      Operador: Operacion.OP_EQ, Valor: null, ValorString: texto, 
                      Valido: true});

      filtros.push( { Id : 'OCR', Negacion : false, Propiedad: "fuzzy",
                      Operador: Operacion.OP_EQ, Valor: null, ValorString: fuzzy, 
                      Valido: true});
    };
    return filtros;
  }

  public EventoFiltrar(filtros: FiltroConsulta[]) {
    // console.debug(filtros);
  }

}
