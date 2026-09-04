import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorJerarquicoComponent } from './editor-jerarquico.component';

describe('EditorJerarquicoComponent', () => {
  let component: EditorJerarquicoComponent;
  let fixture: ComponentFixture<EditorJerarquicoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorJerarquicoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorJerarquicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
