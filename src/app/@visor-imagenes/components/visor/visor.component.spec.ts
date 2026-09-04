import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorComponent } from './visor.component';

describe('VisorComponent', () => {
  let component: VisorComponent;
  let fixture: ComponentFixture<VisorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
