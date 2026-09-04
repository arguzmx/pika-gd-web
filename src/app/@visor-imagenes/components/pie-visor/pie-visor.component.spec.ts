import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PieVisorComponent } from './pie-visor.component';

describe('PieVisorComponent', () => {
  let component: PieVisorComponent;
  let fixture: ComponentFixture<PieVisorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PieVisorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PieVisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
