import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { UserDialogPage } from './user-dialog.page';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { ClassiService } from '../../classes/services/classi.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ModalController, AlertController } from '@ionic/angular/standalone';
import { ReservedNotes4studentsService } from '../services/reservedNotes4Students/reserved-notes4students.service';
import { EvaluationService } from '../../evaluations/services/evaluation/evaluation.service';
import { ActivitiesService } from '../../activities/services/activities.service';
import { of } from 'rxjs';
import { UserModel } from 'src/app/shared/models/userModel';

describe('UserDialogPage', () => {
  let component: UserDialogPage;
  let fixture: ComponentFixture<UserDialogPage>;

  beforeEach(waitForAsync(() => {
    const activatedRouteSpy = {
      snapshot: { paramMap: { get: () => 'test-user-key' } }
    };
    const usersSpy = jasmine.createSpyObj('UsersService', ['getLoggedUser', 'fetchUserOnCache', 'updateUser', 'setUserClaims2user', 'getCustomClaims4LoggedUser']);
    const classiSpy = jasmine.createSpyObj('ClassiService', ['getClassiOnRealtime']);
    const toasterSpy = jasmine.createSpyObj('ToasterService', ['presentToast']);

    const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'getTop']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);

    usersSpy.getLoggedUser.and.returnValue(Promise.resolve(new UserModel()));
    usersSpy.fetchUserOnCache.and.returnValue(Promise.resolve(new UserModel()));
    classiSpy.getClassiOnRealtime.and.returnValue(of([]));
    modalSpy.getTop.and.returnValue(Promise.resolve(undefined));

    TestBed.configureTestingModule({
      imports: [UserDialogPage],
      providers: [
        provideIonicAngular(),
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: UsersService, useValue: usersSpy },
        { provide: ClassiService, useValue: classiSpy },
        { provide: ToasterService, useValue: toasterSpy },
        provideRouter([]),
        { provide: ModalController, useValue: modalSpy },
        { provide: AlertController, useValue: alertSpy },
        { provide: ReservedNotes4studentsService, useValue: { getNotesByStudentAndOwner: jasmine.createSpy('getNotesByStudentAndOwner').and.returnValue(Promise.resolve([])), getNotesOnRealtime: jasmine.createSpy('getNotesOnRealtime').and.callFake(() => {}) } },
        { provide: EvaluationService, useValue: { addEvaluation: jasmine.createSpy('addEvaluation') } },
        { provide: ActivitiesService, useValue: { getActivitiesByClassAndTeacher: jasmine.createSpy('getActivitiesByClassAndTeacher').and.returnValue(Promise.resolve([])) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDialogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
