import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorBootJerarquicoComponent } from './editor-boot-jerarquico.component';

describe('EditorBootJerarquicoComponent', () => {
  let component: EditorBootJerarquicoComponent;
  let fixture: ComponentFixture<EditorBootJerarquicoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorBootJerarquicoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorBootJerarquicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
