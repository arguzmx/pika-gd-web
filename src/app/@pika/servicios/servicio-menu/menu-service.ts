import { NbMenuItem } from '@nebular/theme';

export const menus = [
    {
      title: 'Home',
      icon: 'home-outline',
      link: '/pages/iot-dashboard',
    },
    {
      title: 'OPCIONES',
      group: true,
    },
    {
      title: 'Gestión documental',
      icon: 'archive-outline',
      children: [
        {
          title: 'Cuadros de clasificación',
          link: '/pages/tabular/',
          queryParams: { tipo: 'cuadroclasificacion' },
        },
        {
          title: 'Inventario de expedientes',
          link: '/pages/tabular/',
          queryParams: { tipo: 'activo' },
        },
      ],
    },
    {
      title: 'Configuración organización',
      icon: 'map-outline',
      children: [
        {
          title: 'Dominios',
          link: '/pages/tabular/',
          queryParams: { tipo: 'dominio', id: '', sub: '' },
        },
        {
          title: 'Unidades organizacionales',
          link: '/pages/tabular/',
          queryParams: { tipo: 'unidadorganizacional' },
        },
        {
          title: 'Archivos',
          link: '/pages/tabular/',
          queryParams: { tipo: 'archivo' },
        },
        {
          title: 'Roles',
          link: '/pages/tabular/',
          queryParams: { tipo: 'rol' },
        },
        {
          title: 'Volumenes',
          link: '/pages/tabular/',
          queryParams: { tipo: 'volumen', id: '', sub: '' },
        },
        {
          title: 'Usuarios',
          link: '/pages/tabular/',
          queryParams: { tipo: 'propiedadesusuario' },
        },
      ],
    },
    {
      title: 'Configuración sistema',
      icon: 'settings-2-outline',
      children: [{
        title: 'Permisos',
        link: '/pages/permisos',
      },
        {
          title: 'Catálogo tipo archivo',
          link: '/pages/tabular/',
          queryParams: { tipo: 'tipoarchivo' },
        },
      ],
    },
  ];

export class MenuService {

    public ObtieneMenu(): NbMenuItem[] {
        return  menus;
    }

}
