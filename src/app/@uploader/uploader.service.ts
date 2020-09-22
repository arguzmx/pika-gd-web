import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { Subject, Observable, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUploadConfig } from './model/i-upload-config';

const url = environment.uploadUrl;

@Injectable()
export class UploadService {
  constructor(private http: HttpClient) {}

  public config: IUploadConfig;

  public upload(
    files: any[] = [],
  ): { [key: string]: { progress: Observable<number> } } {
    // this will be the our resulting map
    const status: { [key: string]: { progress: Observable<number> } } = {};

    for (const file of files) {
      const formData: FormData = new FormData();
      formData.append('VolumenId', this.config.VolumenId);
      formData.append('PuntoMontajeId', this.config.PuntoMontajeId);
      formData.append('ElementoId', this.config.ElementoId);
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
