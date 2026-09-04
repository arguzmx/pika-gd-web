import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { OAuthService } from "angular-oauth2-oidc";
import { SesionStore } from "../../../@pika/pika-module";

@Component({
  selector: "ngx-inicio",
  templateUrl: "./inicio.component.html",
  styleUrls: ["./inicio.component.scss"],
})
export class InicioComponent implements OnInit {
  constructor(
    private sesionStore: SesionStore,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const rutas = <any[]>this.route.snapshot.data["entidadesResolver"];
    if (rutas.length > 0) {
      this.sesionStore.setRutasTipo(rutas);
    }
  }
}
