import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxGroupEditorComponent } from './checkbox-group-editor.component';

describe('CheckboxGroupEditorComponent', () => {
  let component: CheckboxGroupEditorComponent;
  let fixture: ComponentFixture<CheckboxGroupEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckboxGroupEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxGroupEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
