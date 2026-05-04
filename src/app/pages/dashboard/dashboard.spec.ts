import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard';
import { UsersService } from 'src/app/shared/services/users.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { ConnectionStatusService } from 'src/app/shared/services/connectionStatus/connection-status.service';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { LocalLockService } from 'src/app/shared/services/local-lock.service';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { UserMenuComponent } from 'src/app/shared/components/user-menu/user-menu.component';
import { ConnectionStatusComponent } from 'src/app/shared/components/connectionStatus/connection-status/connection-status.component';

@Component({ selector: 'app-user-menu', standalone: true, template: '' })
class MockUserMenuComponent {}

@Component({ selector: 'app-connection-status', standalone: true, template: '' })
class MockConnectionStatusComponent {}

describe('Dashboard', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), DashboardPage],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: Auth, useValue: { onAuthStateChanged: () => {} } },
        { provide: UsersService, useValue: { getLoggedUser: jasmine.createSpy('getLoggedUser').and.returnValue(Promise.resolve()), logout: jasmine.createSpy('logout') } },
        { provide: Firestore, useValue: { collection: () => ({}), doc: () => ({}) } },
        { provide: ConnectionStatusService, useValue: { connectionStatus$: of('online') } },
        { provide: LocalLockService, useValue: { lockManually: jasmine.createSpy('lockManually'), clearLock: jasmine.createSpy('clearLock') } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(DashboardPage, {
      remove: { imports: [UserMenuComponent, ConnectionStatusComponent] },
      add: { imports: [MockUserMenuComponent, MockConnectionStatusComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
