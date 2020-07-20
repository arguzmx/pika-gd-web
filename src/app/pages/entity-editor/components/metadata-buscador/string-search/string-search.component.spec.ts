import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StringSearchComponent } from './string-search.component';

describe('StringSearchComponent', () => {
  let component: StringSearchComponent;
  let fixture: ComponentFixture<StringSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StringSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
