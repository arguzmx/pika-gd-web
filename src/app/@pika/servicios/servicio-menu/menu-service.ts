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
      title: 'Configuración global',
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
      title: 'Gestión documental',
      icon: 'archive-outline',
      children: [
        {
          title: 'Catálogo tipo archivo',
          link: '/pages/tabular/',
          queryParams: { tipo: 'tipoarchivo' },
        },
        {
            title: 'Archivos',
            link: '/pages/tabular/',
            queryParams: { tipo: 'archivo' },
          },
        {
          title: 'Cuadros de clasificación',
          link: '/pages/tabular/',
          queryParams: { tipo: 'cuadroclasificacion' },
        },
        {
          title: 'Administrador de activos',
          link: '/pages/tabular/',
          queryParams: { tipo: 'activo' },
        },
      ],
    },
  ];

export class MenuService {

    public ObtieneMenu(): NbMenuItem[] {
        return  menus;
    }

}
