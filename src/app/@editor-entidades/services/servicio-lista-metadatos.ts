import { AppConfig } from './../../app-config';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AsyncSubject, Observable } from "rxjs";
import { debounceTime, first, retry } from "rxjs/operators";
import { Consulta, FiltroConsulta, Operacion } from "../../@pika/consulta";
import { AtributoLista, ValorListaOrdenada } from "../../@pika/metadata";
import { SesionQuery } from "../../@pika/state";

@Injectable()
export class ServicioListaMetadatos {
    constructor(
        private app: AppConfig,    
        private sessionQ: SesionQuery,
        private http: HttpClient,) {
        
    }

    public TypeAhead(lista: AtributoLista, texto: string, url?: string): Observable<ValorListaOrdenada[]> {
        return this.PairListTypeAhead(lista, texto, url);
    }

    public SolicitarLista(lista: AtributoLista, consulta: Consulta, url?: string): Observable<AtributoLista> {
        let query = '';
        const subject = new AsyncSubject<AtributoLista>();
        consulta.FiltroConsulta.forEach(x => query = query + `${x.Propiedad}-${x.Operador}-${x.Valor}`);
        this.PairList(lista, consulta, url).pipe(debounceTime(500), first())
            .subscribe(valores => {
              lista.Valores = valores;
              subject.next(lista);
            },
              (err) => { subject.next(null); },
              () => {
                subject.complete();
              });
        return subject;
      }


    PairList(lista: AtributoLista, consulta: Consulta, url?:string): Observable<ValorListaOrdenada[]> {
        consulta.indice = 0;
        if (lista.TypeAhead === false) {
          consulta.tamano = 1000;
        } else {
          consulta.tamano = 50;
        }
     
        var endpoint = '';
        if( url ){
            endpoint = this.CrearEndpointUrl(url);
        } else {
            console.log(lista.Entidad);
            endpoint = this.CrearEndpointEntidad(lista.Entidad);
        }

        const qs = this.getQueryStringConsulta(consulta);
        return this.http.get<ValorListaOrdenada[]>(endpoint + 'pares' + qs)
          .pipe(
            retry(3),
          );
      }

    private PairListTypeAhead(lista: AtributoLista, texto: string, url?: string): Observable<ValorListaOrdenada[]> {
        const consulta: Consulta = new Consulta();
        const filtro: FiltroConsulta = new FiltroConsulta();
        consulta.indice = 0;
        consulta.tamano = 20;
        filtro.Negacion = false;
        filtro.Operador = Operacion.OP_STARTS;
        filtro.Propiedad = 'Texto',
          filtro.Valor = [texto];
        filtro.ValorString = texto;
        consulta.FiltroConsulta.push(filtro);
        
        var endpoint = '';
        if( url){
            endpoint = this.CrearEndpointUrl(url);
        } else {
            endpoint = this.CrearEndpointEntidad(lista.Entidad);
        }

        const qs = this.getQueryStringConsulta(consulta);
    
        return this.http.get<ValorListaOrdenada[]>(endpoint + 'pares' + qs)
          .pipe(
            retry(3),
          );
      }


      private getQueryStringConsulta(consulta: Consulta): string {
        let qs: string = `?i=${consulta.indice}&t=${consulta.tamano}`;
        qs = qs + `&ordc=${consulta.ord_columna}&ordd=${consulta.ord_direccion}`;
    
        let index: number = 0;
        if (consulta.FiltroConsulta) {
          consulta.FiltroConsulta.forEach((f) => {
            qs =
              qs +
              `&f[${index}][p]=${f.Propiedad}&f[${index}][o]=${f.Operador}&f[${index}][v]=${f.ValorString}`;
    
            if (f.Negacion) qs =
              qs + `&f[${index}][n]=1`;
    
            index++;
          });
        }
        return qs;
      }


      private CrearEndpointUrl(endpoint: string): string {
        let url = '';
        url = this.app.config.pikaApiUrl.replace(/\/$/, '') + '/';
        url = url + endpoint;
        return url;
      }

      private CrearEndpointEntidad(TipoEntidad: string): string {
        let url = '';
    
        // Las rutas de las entidades se obtienen desde el servidor
        if (this.sessionQ.RutasEntidades.length === 0) return url;
    
        const r = this.sessionQ.RutasEntidades.find(x => x.Tipo.toLocaleLowerCase() === TipoEntidad.toLowerCase());
        if (r) {
          url = this.app.config.pikaApiUrl.replace(/\/$/, '') + '/';
          url = url + r.Ruta.replace('{version:apiVersion}', this.app.config.apiVersion).toLocaleLowerCase() + '/';
        }
    
        return url;
      }
    

}