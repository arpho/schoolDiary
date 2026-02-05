import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ActionSheetController, AlertController, ToastController, ModalController } from '@ionic/angular/standalone';
import { Evaluation4StudentComponent } from './evaluation4-student.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { EvaluationService } from '../../../../pages/evaluations/services/evaluation/evaluation.service';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { UserModel } from 'src/app/shared/models/userModel';

describe('Evaluation4StudentComponent', () => {
  let component: Evaluation4StudentComponent;
  let fixture: ComponentFixture<Evaluation4StudentComponent>;

  beforeEach(waitForAsync(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getLoggedUser', 'getUser']);
    const evaluationSpy = jasmine.createSpyObj('EvaluationService', ['getEvaluation4studentAndTeacher', 'deleteEvaluation']);
    const activitiesSpy = jasmine.createSpyObj('ActivitiesService', ['fetchActivityOnCache']);
    const subjectSpy = jasmine.createSpyObj('SubjectService', ['fetchSubject']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const actionSheetSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);

    usersSpy.getLoggedUser.and.returnValue(Promise.resolve(new UserModel()));
    evaluationSpy.getEvaluation4studentAndTeacher.and.callFake((s: string, t: string, cb: any) => cb([]));

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), Evaluation4StudentComponent],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: EvaluationService, useValue: evaluationSpy },
        { provide: ActivitiesService, useValue: activitiesSpy },
        { provide: SubjectService, useValue: subjectSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActionSheetController, useValue: actionSheetSpy },
        { provide: AlertController, useValue: alertSpy },
        { provide: ToastController, useValue: toastSpy },
        { provide: ModalController, useValue: modalSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Evaluation4StudentComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('studentkey', 's1');
    fixture.componentRef.setInput('teacherkey', 't1');

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
