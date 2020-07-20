import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumericEditorComponent } from './numeric-editor.component';

describe('NumericEditorComponent', () => {
  let component: NumericEditorComponent;
  let fixture: ComponentFixture<NumericEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumericEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumericEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
