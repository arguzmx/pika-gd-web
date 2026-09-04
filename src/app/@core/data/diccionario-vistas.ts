import { Injectable } from '@angular/core';
import { DiccionarioNavegacion } from '../../@editor-entidades/editor-entidades.module';


export const DiccionarioVistas: { [type: string]: string } = {
    visorcontenido: '/pages/visor',
    buscarcontenido: '/pages/buscador',
    crearcontenidoactivo: '/pages/linkcontenidogenerico',
};

@Injectable({
    providedIn: 'root',
  })
export class PIKADiccionarioNavegacion extends DiccionarioNavegacion {

    urlPorNombre(nombre: string): string {
        const url = DiccionarioVistas[nombre];
        if (url) {
            return url;
        } else {
            return '';
        }
    }
}
