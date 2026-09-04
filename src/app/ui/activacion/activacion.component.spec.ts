import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivacionComponent } from './activacion.component';

describe('ActivacionComponent', () => {
  let component: ActivacionComponent;
  let fixture: ComponentFixture<ActivacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
