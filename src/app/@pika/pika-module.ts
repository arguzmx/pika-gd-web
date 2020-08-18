import { PikaSesionService } from './pika-api/pika-sesion-service';
import { PikaApiService } from './pika-api/pika-api.service';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [],
  imports: [],
  exports: [],
  providers: [PikaApiService, PikaSesionService]
})
export class PikaModule {}
