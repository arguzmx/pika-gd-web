import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkContenidoGenericoComponent } from './link-contenido-generico.component';

describe('LinkContenidoGenericoComponent', () => {
  let component: LinkContenidoGenericoComponent;
  let fixture: ComponentFixture<LinkContenidoGenericoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkContenidoGenericoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkContenidoGenericoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
