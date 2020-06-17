import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OAuth2LoginComponent } from './oauth2-login.component';

describe('Oauth2LoginComponent', () => {
  let component: OAuth2LoginComponent;
  let fixture: ComponentFixture<OAuth2LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OAuth2LoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OAuth2LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
