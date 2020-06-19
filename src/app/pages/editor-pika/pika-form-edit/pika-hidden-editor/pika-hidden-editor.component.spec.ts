import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaHiddenEditorComponent } from './pika-hidden-editor.component';

describe('PikaHiddenEditorComponent', () => {
  let component: PikaHiddenEditorComponent;
  let fixture: ComponentFixture<PikaHiddenEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaHiddenEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaHiddenEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
