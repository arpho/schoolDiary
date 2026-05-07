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
import { DashboardAdminComponent } from 'src/app/shared/components/dashboard-admin/dashboard-admin';
import { DashboardTeacherComponent } from 'src/app/shared/components/dashboard-teacher/dashboard-teacher';
import { DashboardStudentComponent } from 'src/app/shared/components/dashboard-student/dashboard-student';
import { UsersRole } from 'src/app/shared/models/usersRole';

@Component({ selector: 'app-user-menu', standalone: true, template: '' })
class MockUserMenuComponent {}

@Component({ selector: 'app-connection-status', standalone: true, template: '' })
class MockConnectionStatusComponent {}

@Component({ selector: 'app-dashboard-student', standalone: true, template: '' })
class MockDashboardStudentComponent {}

@Component({ selector: 'app-dashboard-teacher', standalone: true, template: '' })
class MockDashboardTeacherComponent {}

@Component({ selector: 'app-dashboard-admin', standalone: true, template: '' })
class MockDashboardAdminComponent {}


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
      remove: { imports: [UserMenuComponent, ConnectionStatusComponent, DashboardStudentComponent, DashboardTeacherComponent, DashboardAdminComponent] },
      add: { imports: [MockUserMenuComponent, MockConnectionStatusComponent, MockDashboardStudentComponent, MockDashboardTeacherComponent, MockDashboardAdminComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    
    // Replace the real components with our mocks
    component.dashboards = {
      [UsersRole.ADMIN]: MockDashboardAdminComponent as any,
      [UsersRole.TEACHER]: MockDashboardTeacherComponent as any,
      [UsersRole.STUDENT]: MockDashboardStudentComponent as any
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
