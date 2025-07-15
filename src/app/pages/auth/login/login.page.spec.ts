import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute } from '@angular/router';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { Firestore } from '@angular/fire/firestore';
import { InjectionToken } from '@angular/core';
const mockAngularFireAuth = {};

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      { provide: AngularFireAuth, useValue: {} },
      { provide: ActivatedRoute, useValue: {} },
      { provide: FIREBASE_OPTIONS, useValue: {} },
      { provide: Firestore, useValue: {} }
    ]
  });
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
