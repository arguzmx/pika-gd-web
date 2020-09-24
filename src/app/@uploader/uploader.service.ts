import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUploadConfig } from './model/i-upload-config';
import { first } from 'rxjs/operators';

const url = environment.uploadUrl;

@Injectable()
export class UploadService {
  private indiceCarga: number;
  constructor(private http: HttpClient) {
    this.indiceCarga = 1;
  }

  public static NewGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  public config: IUploadConfig;

  public upload(files: any[] = []): { [key: string]: { progress: Observable<number> } } {

    // this will be the our resulting map
    const status: { [key: string]: { progress: Observable<number> } } = {};

    let total: number = files.length;

    for (let i = (total - 1); i >= 0; i--) {
      const file = files[i];
      this.indiceCarga ++;
      const formData: FormData = new FormData();
      formData.append('VolumenId', this.config.VolumenId);
      formData.append('PuntoMontajeId', this.config.PuntoMontajeId);
      formData.append('ElementoId', this.config.ElementoId);
      formData.append('TransaccionId', this.config.TransactionId);
      formData.append('Indice', this.indiceCarga.toString());
      formData.append('VersionId', this.config.VersionId);
      formData.append('file', file, file.name);

      const req = new HttpRequest('POST', url, formData, {
        reportProgress: true,
        responseType: 'text',
      });
      const progress = new Subject<number>();
      this.http.request(req).subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          // calculate the progress percentage
          const percentDone = Math.round((100 * event.loaded) / event.total);

          // pass the percentage into the progress-stream
          progress.next(percentDone);
        } else if (event instanceof HttpResponse) {
          // Close the progress-stream if we get an answer from the API
          // The upload is complete

          progress.complete();
          total--;
          if ( total === 0) {
            this.http.post(url + `/completar/${this.config.TransactionId}`, null)
            .pipe(first())
            .subscribe( result => {
              console.log(result);
            });
          }

        }
        // Save every progress-observable in a map of all observables
        status[file.name] = {
          progress: progress.asObservable(),
        };
      });
    }

    return status;
  }
}
