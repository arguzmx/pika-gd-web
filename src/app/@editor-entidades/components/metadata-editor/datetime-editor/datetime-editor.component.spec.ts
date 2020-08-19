import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatetimeEditorComponent } from './datetime-editor.component';

describe('DatetimeEditorComponent', () => {
  let component: DatetimeEditorComponent;
  let fixture: ComponentFixture<DatetimeEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatetimeEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
