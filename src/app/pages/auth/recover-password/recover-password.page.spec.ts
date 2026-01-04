import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecoverPasswordPage } from './recover-password.page';

import { provideRouter } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { Auth } from '@angular/fire/auth';

describe('RecoverPasswordPage', () => {
  let component: RecoverPasswordPage;
  let fixture: ComponentFixture<RecoverPasswordPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RecoverPasswordPage],
      providers: [
        provideRouter([]),
        { provide: UsersService, useValue: { recoverPassword: jasmine.createSpy('recoverPassword') } },
        { provide: ToasterService, useValue: { presentToast: jasmine.createSpy('presentToast') } },
        { provide: Auth, useValue: {} }
      ]
    });
    fixture = TestBed.createComponent(RecoverPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
