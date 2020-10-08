import { PDENEGARACCESO } from './../seguridad/permiso-acl';
import { ElementoMenu } from './elemento-menu';
import { ACLUsuario } from './../seguridad/acl-usuario';
import { MenuAplicacion } from './menu-aplicacion';
import { NbMenuItem } from '@nebular/theme';

export class ConstructorMenu {

    private acl: ACLUsuario;
    public CreaMenu(menu: MenuAplicacion, acl: ACLUsuario): NbMenuItem[] {
        if (menu && acl) {
            this.acl = acl;
            const Items = [];
            menu.Elementos.forEach(el => {
                const nbmenu = this.CreaItem(el);
                if (nbmenu) Items.push(nbmenu);
            });
            return Items;
        } else {
            return [];
        }
    }

    private CreaItem(el: ElementoMenu): NbMenuItem {
        let adicionar = false;

        if ( el.TokenSeguridad ) {
            const permiso = this.acl.Permisos.find(x => x.ModuloId === el.TokenSeguridad);
            if (permiso) {
                if ( ((permiso.Mascara & PDENEGARACCESO) === 0) && (permiso.Mascara > 0) ) {
                    adicionar = true;
                }
            }
        } else {
            adicionar = true;
        }

        if (adicionar) {
            const item: NbMenuItem = new NbMenuItem();
            item.children = el.Hijos.length > 0 ? [] : null;
            item.title = el.Titulo;
            item.group = el.EsGrupo;
            item.icon = el.Icono ? el.Icono : null;
            item.link = el.URL;

            if (el.Parametros.length > 0) {
                const params = {};
                el.Parametros.forEach( p => {
                    params[p.Id] = p.Valor;
                });
                item.queryParams = params;
            }

            el.Hijos.forEach(hijo => {
                const nbmenu = this.CreaItem(hijo);
                if (nbmenu) item.children.push(nbmenu);
            });


            return item;

        } else {
            console.log("OOOOO");
            return null;
        }

    }

}
