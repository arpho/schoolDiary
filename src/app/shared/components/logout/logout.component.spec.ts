import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LogoutComponent } from './logout.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { Router } from '@angular/router';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), LogoutComponent],
      providers: [
        { provide: UsersService, useValue: { getLoggedUser: jasmine.createSpy('getLoggedUser'), getCustomClaims4LoggedUser: jasmine.createSpy('getCustomClaims4LoggedUser'), logout: jasmine.createSpy('logout') } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
