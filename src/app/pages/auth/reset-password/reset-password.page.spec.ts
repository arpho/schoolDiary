import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResetPasswordPage } from './reset-password.page';
import { UsersService } from 'src/app/shared/services/users.service';
import { Auth } from '@angular/fire/auth';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { of } from 'rxjs';

describe('ResetPasswordPage', () => {
  let component: ResetPasswordPage;
  let fixture: ComponentFixture<ResetPasswordPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ResetPasswordPage],
      providers: [
        { provide: UsersService, useValue: { updatePassword: jasmine.createSpy('updatePassword').and.returnValue(Promise.resolve()) } },
        { provide: Auth, useValue: { currentUser: { email: 'test@example.com' } } },
        { provide: ToasterService, useValue: { presentToast: jasmine.createSpy('presentToast') } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: NavController, useValue: { navigateBack: jasmine.createSpy('navigateBack') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
