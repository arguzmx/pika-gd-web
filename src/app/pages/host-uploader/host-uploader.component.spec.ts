import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HostUploaderComponent } from './host-uploader.component';

describe('HostUploaderComponent', () => {
  let component: HostUploaderComponent;
  let fixture: ComponentFixture<HostUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HostUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
