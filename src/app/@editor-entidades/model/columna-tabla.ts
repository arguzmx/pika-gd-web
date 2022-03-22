export interface ColumnaTabla {
  Id: string;
  Nombre: string;
  Visible: boolean;
  Alternable: boolean;
  Ordenable: boolean;
  Buscable: boolean;
  Tipo: string;
  NombreI18n?: string;
  EsLista: boolean;
  EsFecha: boolean;
  EsNumerico: boolean;
  EsCatalogoVinculado: boolean;
  EsPropiedadExtendida: boolean;
  Formato?: string;
}
