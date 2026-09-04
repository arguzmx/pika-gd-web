import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgSelectorComponent } from './org-selector.component';

describe('OrgSelectorComponent', () => {
  let component: OrgSelectorComponent;
  let fixture: ComponentFixture<OrgSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
