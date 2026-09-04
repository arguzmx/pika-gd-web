import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorArbolEntidadComponent } from './editor-arbol-entidad.component';

describe('EditorArbolEntidadComponent', () => {
  let component: EditorArbolEntidadComponent;
  let fixture: ComponentFixture<EditorArbolEntidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorArbolEntidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorArbolEntidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
