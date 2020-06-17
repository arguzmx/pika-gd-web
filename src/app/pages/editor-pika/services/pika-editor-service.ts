import { OnInit, OnDestroy } from '@angular/core';
import { Observable} from 'rxjs';
import { MetadataInfo, Propiedad } from '../../../@pika/metadata';
import { Consulta, Paginado } from '../../../@pika/consulta';
import { PikaApiService } from '../../../@pika/pika-api';

interface TablaEventObject {
  event: string;
  value: {
    limit: number;
    page: number;
    key: string;
    order: string;
  };
}

interface ColumnaTabla {
  Id: string;
  Nombre: string;
  Visible: boolean;
  Alternable: boolean;
  Ordenable: boolean;
  Buscable: boolean;
  Tipo: string;
}


class PikaEditorService implements OnInit, OnDestroy {
  private metadata: MetadataInfo;
  private entidad: string;

  public MetadatosValidos: boolean = false;
  public ClienteValido: boolean = false;

  constructor(
    private cliente: PikaApiService<any, string>,
  ) {}

  public GetMetadatos(): MetadataInfo {
    return this.metadata;
  }

  // Obiene una página de datos desde el servidor
  public GetData(consulta: Consulta): Observable<Paginado<any>> {
    return this.cliente.Page(consulta);
  }

  // Obtiene las columas disponibles para mostrase en la tabla
  public GetColumnasTabla(): ColumnaTabla[] {
    const columnas: ColumnaTabla[] = [];
    for (let i = 0; i < this.metadata.Propiedades.length; i++) {
      const c = this.metadata.Propiedades[i];
      const t = c.AtributoTabla;

      if (t) {
        if (t.Visible || t.Alternable) {
          columnas.push({
            Id: c.Id,
            Nombre: c.Nombre,
            Ordenable: c.Ordenable,
            Buscable: c.Buscable,
             Visible: t.Visible,
             Alternable: t.Alternable,
             Tipo: c.TipoDatoId,
          });
        }

      }
    }
    return columnas;
  }


  public GetCamposFlitrables(): Propiedad[] {
    const columnas: Propiedad[] = [];
    for (let i = 0; i < this.metadata.Propiedades.length; i++) {
      const c = this.metadata.Propiedades[i];
      if (c.Buscable) {
        columnas.push(c);
      }
    }
    return columnas;
  }



  // Obtiene los metadatps y devuelve true en caso de éxito
  public ObtienePagina = new Observable((observer) => {
    this.cliente.GetMetadata().subscribe(
      (response) => {
        this.metadata = response;
        this.MetadatosValidos = true;
        observer.next(true);
      },
      (error) => {
        observer.error(error);
      },
    );

    return {
      unsubscribe() {
        // noda que hacer
      },
    };
  });

  // Obtiene los metadatps y devuelve true en caso de éxito
  public ObtieneMetadatos = new Observable((observer) => {
    this.cliente.GetMetadata().subscribe(
      (response) => {
        this.metadata = response;
        this.MetadatosValidos = true;
        observer.next(true);
      },
      (error) => {
        observer.error(error);
      },
    );

    return {
      unsubscribe() {
        // noda que hacer
      },
    };
  });

  // verifica la existencia de una entidad en la ruta y realiza la lectura de metados
  ngOnInit(): void {
  }

  ngOnDestroy(): void {

  }
}

export { PikaEditorService, ColumnaTabla, TablaEventObject };
