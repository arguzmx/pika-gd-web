import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderThumbsComponent } from './header-thumbs.component';

describe('HeaderThumbsComponent', () => {
  let component: HeaderThumbsComponent;
  let fixture: ComponentFixture<HeaderThumbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderThumbsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderThumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
