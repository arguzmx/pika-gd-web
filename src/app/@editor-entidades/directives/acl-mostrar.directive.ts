
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[ngxAclMostrar]',
})
export class AclMostrarDirective implements OnInit, OnChanges {
  mostrar: boolean;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.mostrar = changes['ngxAclMostrar'].currentValue;
    this.Procesar();
  }

  private Procesar() {
    if (this.mostrar) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
 
  ngOnInit(): void {
    this.Procesar();
  }



  @Input() set ngxAclMostrar(mostrar: boolean) {
    this.mostrar = mostrar;
  }

}
