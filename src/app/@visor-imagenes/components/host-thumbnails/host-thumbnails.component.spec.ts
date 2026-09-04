import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HostThumbnailsComponent } from './host-thumbnails.component';

describe('HostThumbnailsComponent', () => {
  let component: HostThumbnailsComponent;
  let fixture: ComponentFixture<HostThumbnailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HostThumbnailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostThumbnailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
