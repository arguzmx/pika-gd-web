import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { PikaApiService, PostTareaEnDemanda, SesionQuery } from '../../@pika/pika-module';
import { AppConfig } from '../../app-config';

@Injectable({
  providedIn: 'root'
})
export class CanalTareasService {

  private BusTareas = new BehaviorSubject([]);
  public cliente: PikaApiService<any, string>;
  
  constructor(
    private app: AppConfig,
    private http: HttpClient,
    private sesion: SesionQuery,) {
      this.Init();
     }

    private Init(): void {
      this.cliente = new PikaApiService(this.app, this.sesion, this.http);
      this.startTimer();
    }

  // El primer intento se hace a los 5 segundos de iniciada la app
  timeLeft: number = 5;
  private interval: any;
  
  startTimer() {
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft -= 5;
      } else {
        this.pauseTimer();
        this.GetTareasOnDemand();
      }
    },5000)
  }

  pauseTimer() {
    clearInterval(this.interval);
    this.timeLeft = 60;
  }

  private GetTareasOnDemand() {
      this.cliente.ObtenerTareasEnDemanda().pipe(first()).subscribe( tareas => {
          this.BusTareas.next(tareas);
      }, (err)=> {
        this.startTimer();
      }, ()=> {
        this.startTimer();} )
  }

  public EliminarTarea(id: string): Observable<any>{
      this.timeLeft = 5;
      return this.cliente.EliminarTareaEnDemanda(id);
  }

  public TareasServer(): Observable<PostTareaEnDemanda[]> {
      return this.BusTareas.asObservable();
  }

}
