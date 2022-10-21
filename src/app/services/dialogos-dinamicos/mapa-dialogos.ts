import { Component } from "@angular/core";
import { ConfirmacionComponent } from "../../@editor-entidades/components/confirmacion/confirmacion.component";
import { DialogoDeclinarActivoTxComponent } from "./dialogo-declinar-activo-tx/dialogo-declinar-activo-tx.component";

export type TipoDialogos = 'confirmacion' 
    | 'declinar-activos-tx' 
    | 'aceptar-activos-tx'
    | 'enviar-transferencia'
    | 'aceptar-transferencia'
    | 'declinar-transferencia';

export const MapaDialogos  =  new Map<string, any>([
    [ 'confirmacion', ConfirmacionComponent ],
    [ 'declinar-activos-tx', DialogoDeclinarActivoTxComponent ],
    [ 'aceptar-activos-tx', ConfirmacionComponent ],
    [ 'enviar-transferencia', ConfirmacionComponent ],
    [ 'aceptar-transferencia', ConfirmacionComponent ],
    [ 'declinar-transferencia', ConfirmacionComponent ]
]);

