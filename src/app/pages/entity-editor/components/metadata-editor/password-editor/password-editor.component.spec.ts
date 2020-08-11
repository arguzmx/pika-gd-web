import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordEditorComponent } from './password-editor.component';

describe('PasswordEditorComponent', () => {
  let component: PasswordEditorComponent;
  let fixture: ComponentFixture<PasswordEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
