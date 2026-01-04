import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SignupPage } from './signup.page';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { UsersService } from 'src/app/shared/services/users.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { of } from 'rxjs';

describe('SignupPage', () => {
  let component: SignupPage;
  let fixture: ComponentFixture<SignupPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SignupPage],
      providers: [
        { provide: AuthService, useValue: { signup: jasmine.createSpy('signup').and.returnValue(Promise.resolve()) } },
        { provide: UsersService, useValue: { signupUser: jasmine.createSpy('signupUser').and.returnValue(Promise.resolve()) } },
        { provide: ToasterService, useValue: { presentToast: jasmine.createSpy('presentToast') } },
        { provide: Auth, useValue: {} },
        { provide: Firestore, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
