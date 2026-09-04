import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderVisorComponent } from './header-visor.component';

describe('HeaderVisorComponent', () => {
  let component: HeaderVisorComponent;
  let fixture: ComponentFixture<HeaderVisorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderVisorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderVisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
