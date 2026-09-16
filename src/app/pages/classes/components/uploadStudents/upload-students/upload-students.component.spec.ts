import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIonicAngular, AlertController, ModalController } from '@ionic/angular/standalone';
import { UsersService } from 'src/app/shared/services/users.service';

import { UploadStudentsComponent } from './upload-students.component';

describe('UploadStudentsComponent', () => {
  let component: UploadStudentsComponent;
  let fixture: ComponentFixture<UploadStudentsComponent>;

  beforeEach(async () => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['createUser']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    await TestBed.configureTestingModule({
      imports: [UploadStudentsComponent],
      providers: [
        provideIonicAngular(),
        { provide: UsersService, useValue: usersSpy },
        { provide: AlertController, useValue: alertSpy },
        { provide: ModalController, useValue: modalSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
