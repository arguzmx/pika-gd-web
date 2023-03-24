import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { Observable, Subject } from "rxjs";
import { SesionQuery } from "../../../@pika/pika-module";
import { Pagina } from "../../model/pagina";

@Component({
  selector: "ngx-visor-pdf",
  templateUrl: "./visor-pdf.component.html",
  styleUrls: ["./visor-pdf.component.scss"],
})
export class VisorPdfComponent implements OnInit, OnChanges {
  @Input() pagina: Pagina;
  public url: string = "";
  public bearerToken: string | undefined = undefined;
  public dataUrl$: Observable<any>;
  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(private sessionQuery: SesionQuery) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.muestraPDF();
  }

  ngOnInit(): void {
    this.bearerToken = "Bearer " + this.sessionQuery.getJWT;
  }

  muestraPDF() {
    console.log(this.url);
    console.log(this.pagina.Url);
    this.url = this.pagina.Url ? this.pagina.Url : "";
  }
}
