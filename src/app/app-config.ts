import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { environment } from '../environments/environment';

export interface ApplicationConfiguration {
    authUrl: string, 
    apiUrl: string,
    pikaApiUrl: string,
    apiVersion: string,
    editorToken: string,
    callbackRoute: string,
    cacheActivo: boolean,
    uploadUrl: string,
    visordUrl: string,
    mediaUrl: string,
    healthendpoint: string;
}

@Injectable()
export class AppConfig {
    constructor(private client: HttpClient) {}

    public config: ApplicationConfiguration = null;
    load() {
        var url = environment.production ? './config.json' : './config.json'; 
        return new Promise((resolve, reject) => {
            return this.client.get<ApplicationConfiguration>(url).subscribe(r=>{
                this.config = r;
                if (!this.config.healthendpoint) {
                    this.config.healthendpoint = 'servicios/health';
                }
                resolve(true);
            }, (err)=>{
                resolve(false);
            }, () => {
                resolve(true);
            } );
        });
     
  }
}

@Injectable()
export class TokenProvider {
constructor() {}
  
  load(){
    
  }
}