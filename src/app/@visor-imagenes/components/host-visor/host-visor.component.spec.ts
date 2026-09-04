import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HostVisorComponent } from './host-visor.component';

describe('HostVisorComponent', () => {
  let component: HostVisorComponent;
  let fixture: ComponentFixture<HostVisorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HostVisorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostVisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
