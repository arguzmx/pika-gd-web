import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class InfoService {

    data: Subject<boolean> = new Subject();

    constructor() {
    }
}
