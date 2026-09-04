import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmacionComponent } from './confirmacion.component';

describe('ConfirmacionComponent', () => {
  let component: ConfirmacionComponent;
  let fixture: ComponentFixture<ConfirmacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
