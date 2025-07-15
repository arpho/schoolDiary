import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupPage } from './signup.page';

import { AuthService } from 'src/app/shared/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
const mockAuthService = {};

describe('SignupPage', () => {
  let component: SignupPage;
  let fixture: ComponentFixture<SignupPage>;

  beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: {} },
      { provide: Auth, useValue: {} },
      { provide: Firestore, useValue: { collection: () => ({ valueChanges: () => ({ subscribe: () => {} }) }) } }
    ]
  });
    fixture = TestBed.createComponent(SignupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
