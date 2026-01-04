import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard';
import { UsersService } from 'src/app/shared/services/users.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

describe('Dashboard', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: {} },
      { provide: Auth, useValue: {} },
      { provide: UsersService, useValue: { getLoggedUser: jasmine.createSpy('getLoggedUser').and.returnValue(Promise.resolve()) } },
      { provide: Firestore, useValue: {} }
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
