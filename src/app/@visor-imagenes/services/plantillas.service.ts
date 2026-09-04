import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Plantilla } from '../model/plantilla';
import { DocumentosService } from './documentos.service';

@Injectable()
export class PlantillasService {

  constructor(private docService: DocumentosService) {
    
  }

  public ObtienePlantillas(): Observable<Plantilla[]> {
    return this.docService.ObtienePlantillas();
  }

}
