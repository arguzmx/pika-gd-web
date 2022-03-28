import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { environment } from '../environments/environment';

export interface ApplicationConfiguration {
    host?: string,
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
    healthendpoint: string,
    hosts?: ApplicationConfiguration[]
}

@Injectable()
export class AppConfig {
    constructor(private client: HttpClient) {}

    public config: ApplicationConfiguration = null;
    load() {
        var url = environment.production ? './config.json' : './config.json'; 
        return new Promise((resolve, reject) => {
            return this.client.get<ApplicationConfiguration>(url).subscribe(config=>{
                
                let r = null
                if(config.hosts.length > 0) {
                    const host = config.hosts.find(h=>h.host === window.location.host);
                    if (host != undefined) {
                        r = host;
                    } else {
                        r = config;    
                    }
                }

                if(!r.authUrl.endsWith('/')) {
                    r.authUrl = `${r.authUrl}/`;
                }

                if(!r.pikaApiUrl.endsWith('/')) {
                    r.pikaApiUrl = `${r.pikaApiUrl}/`;
                }

                if(!r.apiUrl.endsWith('/')) {
                    r.apiUrl = `${r.apiUrl}/`;
                }
                
                this.config = r;
                if (!this.config.healthendpoint) {
                    this.config.healthendpoint = 'health';
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