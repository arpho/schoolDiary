import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { provideIonicAngular, IonBackButton } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { ActionSheetController } from '@ionic/angular/standalone';
import { UsersListPage } from './users-list.page';
import { UsersService } from 'src/app/shared/services/users.service';
import { Router } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { FormBuilder } from '@angular/forms';
import { ClassiService } from '../../classes/services/classi.service';
import { of } from 'rxjs';
import { UserModel } from 'src/app/shared/models/userModel';
import { Firestore } from '@angular/fire/firestore';

describe('UsersListPage', () => {
  let component: UsersListPage;
  let fixture: ComponentFixture<UsersListPage>;

  beforeEach(waitForAsync(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getUsersOnRealTime']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const toasterSpy = jasmine.createSpyObj('ToasterService', ['presentToast']);
    const classiSpy = jasmine.createSpyObj('ClassiService', ['getClassiOnRealtime']);
    const actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);

    classiSpy.getClassiOnRealtime.and.returnValue(of([]));
    usersSpy.getUsersOnRealTime.and.callFake((cb: any) => cb([])); // Execute callback immediately

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UsersListPage],
      providers: [
        provideIonicAngular(),
        { provide: UsersService, useValue: usersSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToasterService, useValue: toasterSpy },
        { provide: ClassiService, useValue: classiSpy },
        { provide: ActionSheetController, useValue: actionSheetSpy },
        { provide: NavController, useValue: jasmine.createSpyObj('NavController', ['navigateForward', 'navigateRoot', 'back']) },
        FormBuilder
      ]
    }).compileComponents();

  }));

  it('should create', () => {
    TestBed.overrideComponent(UsersListPage, {
      remove: { imports: [IonBackButton] },
      add: { imports: [MockIonBackButton] }
    });
    fixture = TestBed.createComponent(UsersListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});

@Component({
  selector: 'ion-back-button',
  template: '',
  standalone: true
})
class MockIonBackButton {}
