import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HiddenEditorComponent } from './hidden-editor.component';

describe('HiddenEditorComponent', () => {
  let component: HiddenEditorComponent;
  let fixture: ComponentFixture<HiddenEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HiddenEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HiddenEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
