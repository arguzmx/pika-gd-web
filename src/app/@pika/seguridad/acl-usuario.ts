import { PermisoACL } from './permiso-acl';

export interface ACLUsuario {
    UsuarioId: string;
    EsAdmin: boolean;
    DominioId: string;
    OUId: string;
    Permisos: PermisoACL[];
}
