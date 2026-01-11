import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, AlertController } from '@ionic/angular';
import { UsersService } from 'src/app/shared/services/users.service';

import { UploadStudentsComponent } from './upload-students.component';

describe('UploadStudentsComponent', () => {
  let component: UploadStudentsComponent;
  let fixture: ComponentFixture<UploadStudentsComponent>;

  beforeEach(waitForAsync(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['createUser']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), UploadStudentsComponent],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: AlertController, useValue: alertSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
