import { TipoSeguridad } from './metadata/metadata-info';
import { AppEventBus } from './state/app-event-bus';
import { PEJECUTAR, PELIMINAR, PESCRIBIR, PLEER, PADMINISTRAR } from './seguridad/permiso-acl';
import { EntidadesResolver } from './servicios/resolvers/entidades-resolver';
import { PikaSesionService } from './pika-api/pika-sesion-service';
import { NgModule } from '@angular/core';

import { Acciones, MetadataInfo, EntidadVinculada, TipoCardinalidad,
  TipoDespliegueVinculo,
  tDate,
  tTime,
  ValorListaOrdenada,
  AtributoLista,
  tDouble,
  tInt64,
  tInt32,
  Propiedad,
  tDateTime,
  Operaciones,
  tBoolean,
  tString,
  tBinaryData,
  tList,
  HTML_CHECKBOX_MULTI,
  HTML_HIDDEN,
  HTML_PASSWORD_CONFIRM,
  AtributoVistaUI,
  PLATAFORMA_WEB,
  Eventos, Evento, HTML_DATETIME, HTML_DATE, HTML_TIME,
  AtributoEvento, IProveedorReporte, HTML_SELECT_MULTI, LinkVista, ParametroLinkVista } from './metadata/index';
import { NodoJerarquico, Operacion, FiltroConsulta, Consulta, TextpOperador, Paginado } from './consulta/index';
import { SesionQuery, AppBusStore, PropiedadesBus, SesionStore, AppBusQuery } from './state/index';
import { TraduccionEntidad } from './comunes/index';
import { DominioActivo, UnidadOrganizacionalActiva } from './sesion';
import { httpInterceptorProviders } from './pika-api/interceptor-provider';
import { Aplicacion, PermisoAplicacion, ModuloAplicacion, TipoModulo,
        TraduccionAplicacionModulo, Rol, ACLUsuario, PermisoACL, PDENEGARACCESO, RespuestaPermisos } from './seguridad';
import { PikaApiService } from './pika-api';
import { ValorPropiedad } from './metadata/valor-propiedad';
import { DocumentoPlantilla } from './metadata/documeto-plantilla';
import { VinculoDocumentoPlantilla, VinculosObjetoPlantilla } from './metadata/vinculos-objeto-plantilla';
import { RequestValoresPlantilla } from './metadata/request-valores-plantilla';
import { PropiedadesExtendidas, PropiedadExtendida, ValoresEntidad } from './consulta/propiedades-extendidas';
import { RespuestaComandoWeb } from './comunes/respuesta-comando-web';
import { PermisoPuntoMontaje } from './conteido/permiso-punto-montaje';
import { PostTareaEnDemanda } from './modelos/post-tareaendemanda';
@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: [AppEventBus],
})
class PikaModule {
}

export {PikaModule, Acciones, MetadataInfo, Propiedad, NodoJerarquico, 
    EntidadVinculada, TipoCardinalidad, TipoDespliegueVinculo, FiltroConsulta,
  Operacion, Consulta, Eventos, Evento, Operaciones, ValorListaOrdenada, AtributoLista,
  TextpOperador, PikaApiService, Paginado, SesionQuery, TraduccionEntidad, AtributoEvento,
  AtributoVistaUI, HTML_PASSWORD_CONFIRM, HTML_HIDDEN, HTML_CHECKBOX_MULTI, PLATAFORMA_WEB, HTML_SELECT_MULTI,
  AppBusStore, PropiedadesBus,
  HTML_DATE, HTML_TIME, HTML_DATETIME, PikaSesionService, IProveedorReporte,
  DominioActivo, SesionStore, AppBusQuery, UnidadOrganizacionalActiva,
  tDate, tTime, tDouble, tBoolean, tString, tBinaryData, tList, tInt64, tInt32, tDateTime, TipoSeguridad,
  httpInterceptorProviders, Aplicacion, PermisoAplicacion, ModuloAplicacion, TipoModulo, TraduccionAplicacionModulo,
  LinkVista, ParametroLinkVista, Rol, EntidadesResolver, ACLUsuario, PermisoACL, PDENEGARACCESO, PEJECUTAR, PELIMINAR,
  PESCRIBIR, PLEER, PADMINISTRAR, ValorPropiedad, DocumentoPlantilla, VinculosObjetoPlantilla, VinculoDocumentoPlantilla,
  RequestValoresPlantilla, RespuestaPermisos, PropiedadesExtendidas, ValoresEntidad, PropiedadExtendida, RespuestaComandoWeb,
  PermisoPuntoMontaje, PostTareaEnDemanda
};
