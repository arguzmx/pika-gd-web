import { FiltroConsulta } from './../../../../@pika/consulta/filtro-consulta';
import { EditorService } from './../../services/editor-service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CampoEditable } from '../../model/campo';
import { FormGroup } from '@angular/forms';
import { ValorListaOrdenada } from '../../../../@pika/metadata/valor-lista';
import { Propiedad } from '../../../../@pika/metadata';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Consulta, Operacion } from '../../../../@pika/consulta';
import { EditFieldBase } from '../edit-field-base';

import {
  Operaciones,
  Evento,
} from '../../../../@pika/metadata/atributo-evento';

@Component({
  selector: 'ngx-pika-list-editor',
  templateUrl: './pika-list-editor.component.html',
  styleUrls: ['./pika-list-editor.component.scss'],
})
export class PikaListEditorComponent extends EditFieldBase
  implements CampoEditable, OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  config: Propiedad;
  group: FormGroup;
  list: ValorListaOrdenada[];
  selected: any = null;
  isUpdate: boolean;

  constructor(editorService: EditorService) {
    super(editorService);
  }

  ObtieneEventos(): void {
    this.editorService
      .ObtieneEventos()
      .pipe(takeUntil(this.destroy$))
      .subscribe((r) => {
        if (r) {
          // Sólo se procesan eventos de otros controles
          if (r.Origen !== this.config.Id) {
            console.log(r);
            if (this.config.AtributosEvento) {
              this.config.AtributosEvento.forEach((att) => {
                if (att.Entidad === r.Origen && att.Evento === r.Evento) {
                  switch (att.Operacion) {
                    case Operaciones.Actualizar:
                      this.ActualizarLista(r);
                      break;
                  }
                }
              });
            }
          }
        }
      });
  }

  ActualizarLista(evt: Evento) {
    this.EmiteEventoCambio(this.config.Id, '');

    const consulta = new Consulta();
    const f = new FiltroConsulta();
    f.Operador = Operacion.OP_EQ;
    f.Propiedad = evt.Origen;
    f.Valor = [ evt.Valor ];
    f.ValorString = evt.Valor;

    this.list = null;
    this.selected = null;

    consulta.FiltroConsulta.push(f);

    this.editorService.SolicitarLista(
      this.config.AtributoLista,
      consulta,
    );
  }

  ObtieneNuevasListas(): void {
    this.editorService
      .ObtieneNuevasListas()
      .pipe(takeUntil(this.destroy$))
      .subscribe((r) => {
        if (r) {

          console.log(r);
          console.log(r.Default);
          if (this.isUpdate) {
              r.Default = this.group.get(this.config.Id).value;
          }


          if (r.Valores && r.Valores.length > 0) {
            console.log("valores disponibles");
            if (this.config.Nombre === r.PropiedadId) {
              this.config.ValoresLista = r.Valores;

              if (this.config.OrdenarValoresListaPorNombre) {
                this.list = this.Sort('Texto');
              } else {
                this.list = this.Sort('Indice');
              }

              // Si existe un valor default lo selecciona y emite el evento de cambio
              if (r.Default) {
                this.group.get(this.config.Id).patchValue(r.Default);
                this.selected = r.Default;
                this.EmiteEventoCambio(this.config.Id, r.Default);
              }
            }
          }
        }
      });
  }

  onChange(value) {
    this.EmiteEventoCambio(this.config.Id, value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {

    this.ObtieneEventos();
    this.ObtieneNuevasListas();

    if (this.config.AtributoLista) {

      if (this.isUpdate) {
        this.config.AtributoLista.Default = this.group.get(this.config.Id).value;
      }

      const precargar = !this.TieneEventos();
      // sólo precarga los datos si no dependen de otra entidad
      if (precargar && this.config.AtributoLista.DatosRemotos) {
        this.editorService.SolicitarLista(
          this.config.AtributoLista,
          new Consulta(),
        );
      }

    } else {
      if (this.config.OrdenarValoresListaPorNombre) {
        this.list = this.Sort('Texto');
      } else {
        this.list = this.Sort('Indice');
      }
    }

  }

  private TieneEventos(): boolean {
    let eventos = false;
    if (this.config.AtributosEvento) {
      if (this.config.AtributosEvento.length > 0) {
        eventos = true;
      }
    }
    return eventos;
  }

  Sort(by: string) {
    return this.config.ValoresLista.sort((obj1, obj2) => {
      if (obj1[by] > obj2[by]) {
        return 1;
      }
      if (obj1[by] < obj2[by]) {
        return -1;
      }
      return 0;
    });
  }
}
