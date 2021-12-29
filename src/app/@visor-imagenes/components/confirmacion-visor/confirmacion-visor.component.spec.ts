import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmacionVisorComponent } from './confirmacion-visor.component';

describe('ConfirmacionVisorComponent', () => {
  let component: ConfirmacionVisorComponent;
  let fixture: ComponentFixture<ConfirmacionVisorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmacionVisorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmacionVisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
