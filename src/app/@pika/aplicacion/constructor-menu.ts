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


        if (this.acl.EsAdmin) {
            adicionar = true;
        } else {
            if ( el.TokenMod && el.TokenApp ) {
                const permiso = this.acl.Permisos.find(x => x.AplicacionId === el.TokenApp
                    && x.ModuloId === el.TokenMod);
                if (permiso) {
                    if ( ((permiso.Mascara & PDENEGARACCESO) === 0) && (permiso.Mascara > 0) ) {
                        adicionar = true;
                    }
                }
            } else {
                // No valida ACL para los elementos del menú que no incluyen token de seguridad
                adicionar = true;
            }
        }

        if (adicionar) {
            const item: NbMenuItem = new NbMenuItem();
            item.children = el.Hijos.length > 0 ? [] : null;
            item.title = el.Titulo;
            item.group = el.EsGrupo;
            item.icon = el.Icono ? el.Icono : null;
            item.link = el.URL;
            item.home = el.EsHome;

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

            const links = this.TieneLinksActivos(item);
            return links ? item : null;

        } else {
            return null;
        }

    }


    private TieneLinksActivos(item: NbMenuItem): boolean {
        
        if (item.link != '') {
            return true;
        }

        if (item.children) {
            let activos = false;
            const cuenta = item.children.filter(x => x.link != '' && x.group == false).length;
            if (cuenta > 0) {
                return true;
            } else {
                if (item.children && item.children.length > 0){
                    for(var i=0; i<item.children.length; i++) {
                        activos = this.TieneLinksActivos(item.children[i]);
                        if (activos) {
                            return true
                        }
                    }
                }
            }
        }

        return false;
    }

}
