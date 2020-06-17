import { NbMenuItem } from '@nebular/theme';

export interface Sesion {
    IdUsuario: string;
    IdDominio: string;
    IdUnidadOrganizacional: string;
    Nombre: string;
    AvatarBase64: string;
    token: string;
    isLoggedIn: boolean;
    Menus: NbMenuItem[];
}

