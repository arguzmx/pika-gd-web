import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorTemasSeleccionComponent } from './editor-temas-seleccion.component';

describe('EditorTemasSeleccionComponent', () => {
  let component: EditorTemasSeleccionComponent;
  let fixture: ComponentFixture<EditorTemasSeleccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorTemasSeleccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorTemasSeleccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
