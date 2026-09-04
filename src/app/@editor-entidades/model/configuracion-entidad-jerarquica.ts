import { ConfiguracionEntidad } from './configuracion-entidad';

export interface ConfiguracionEntidadJerarquica {
  ConfiguracionJerarquia: ConfiguracionEntidad;
  ConfiguracionContenido: ConfiguracionEntidad;
}
