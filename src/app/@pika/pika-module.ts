import { PikaSesionService } from './pika-api/pika-sesion-service';
import { PikaApiService } from './pika-api/pika-api.service';
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
  Eventos, Evento, HTML_DATETIME, HTML_DATE, HTML_TIME } from './metadata/index';
import { NodoJerarquico, Operacion, FiltroConsulta, Consulta, TextpOperador, Paginado } from './consulta/index';
import { AppLogService } from './servicios/index';
import { SesionQuery } from './state/index';
import { TraduccionEntidad } from './comunes/index';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: [PikaApiService, PikaSesionService],
})
class PikaModule {
}

export {PikaModule, Acciones, MetadataInfo, Propiedad, NodoJerarquico, AppLogService,
  EntidadVinculada, TipoCardinalidad, TipoDespliegueVinculo, FiltroConsulta,
  Operacion, Consulta, Eventos, Evento, Operaciones, ValorListaOrdenada, AtributoLista,
  TextpOperador, PikaApiService, Paginado, SesionQuery, TraduccionEntidad,
  AtributoVistaUI, HTML_PASSWORD_CONFIRM, HTML_HIDDEN, HTML_CHECKBOX_MULTI, PLATAFORMA_WEB,
  HTML_DATE, HTML_TIME, HTML_DATETIME,
  tDate, tTime, tDouble, tBoolean, tString, tBinaryData, tList, tInt64, tInt32, tDateTime,
   };
