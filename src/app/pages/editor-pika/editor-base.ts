import { PikaApiService } from './../../@pika/pika-api/pika-api.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PikaEditorService } from './services/pika-editor-service';
import { environment } from '../../../environments/environment';

export default class PikaEditorBase {
  public entidad: string = '';
  public eService: PikaEditorService;
  public cliente: PikaApiService<any, string>;
  public baseUrl: string = environment.apiUrl;

  constructor(public route: ActivatedRoute, public http: HttpClient) {}

  public CreaCliente(): void {
    this.cliente = new PikaApiService(this.baseUrl, this.entidad, this.http);
    this.eService = new PikaEditorService(this.cliente);
  }
}
