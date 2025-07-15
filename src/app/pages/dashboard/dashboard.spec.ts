import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard';

import { AuthService } from 'src/app/shared/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
const mockAuthService = {};

describe('Dashboard', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: {} },
      { provide: Auth, useValue: {} },
      { provide: Firestore, useValue: { collection: () => ({ valueChanges: () => ({ subscribe: () => {} }) }) } }
    ]
  });
    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
