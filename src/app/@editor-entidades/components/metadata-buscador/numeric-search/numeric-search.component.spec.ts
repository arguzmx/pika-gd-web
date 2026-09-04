import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumericSearchComponent } from './numeric-search.component';

describe('NumericSearchComponent', () => {
  let component: NumericSearchComponent;
  let fixture: ComponentFixture<NumericSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumericSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumericSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
