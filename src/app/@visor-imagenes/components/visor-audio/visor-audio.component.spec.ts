import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorAudioComponent } from './visor-audio.component';

describe('VisorAudioComponent', () => {
  let component: VisorAudioComponent;
  let fixture: ComponentFixture<VisorAudioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorAudioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
