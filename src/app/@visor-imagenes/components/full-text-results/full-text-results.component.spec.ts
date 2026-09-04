import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullTextResultsComponent } from './full-text-results.component';

describe('FullTextResultsComponent', () => {
  let component: FullTextResultsComponent;
  let fixture: ComponentFixture<FullTextResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullTextResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullTextResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
