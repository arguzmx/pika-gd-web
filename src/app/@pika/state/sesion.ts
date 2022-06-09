import { DominioActivo } from './../sesion/dominio-activo';
import { NbMenuItem } from '@nebular/theme';
import { ACLUsuario } from '../seguridad';
import { MenuAplicacion } from '../aplicacion';
export interface Sesion {
    IdUsuario: string;
    IdDominio: string;
    IdUnidadOrganizacional: string;
    Nombre: string;
    AvatarBase64: string;
    token: string;
    isLoggedIn: boolean;
    MenuItems: NbMenuItem[];
    uilocale: string;
    Dominios: DominioActivo[];
    ACL: ACLUsuario;
    MenuApp: MenuAplicacion;
    ModoVisorActivado: boolean;
}

