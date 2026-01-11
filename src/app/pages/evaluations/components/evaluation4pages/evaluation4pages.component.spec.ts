import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Evaluation4pagesComponent } from './evaluation4pages.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ModalController } from '@ionic/angular/standalone';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { UnsubscribeService } from 'src/app/shared/services/unsubscribe.service';

describe('Evaluation4pagesComponent', () => {
  let component: Evaluation4pagesComponent;
  let fixture: ComponentFixture<Evaluation4pagesComponent>;

  beforeEach(waitForAsync(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getUser', 'getSubjectsByTeacherAndClass', 'fetchUserOnCache']);
    usersSpy.getSubjectsByTeacherAndClass.and.returnValue(Promise.resolve([]));
    const evaluationSpy = jasmine.createSpyObj('EvaluationService', ['addEvaluation']);
    const activitiesSpy = jasmine.createSpyObj('ActivitiesService', ['getActivities4teacherOnRealtime', 'addActivity']);
    const gridsSpy = jasmine.createSpyObj('GridsService', ['getGridsOnRealtime']);
    const classiSpy = jasmine.createSpyObj('ClassiService', ['fetchClasseOnCache']);
    const toasterSpy = jasmine.createSpyObj('ToasterService', ['presentToast']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);

    const activatedRouteSpy = {
      snapshot: { paramMap: { get: () => 'test-id' } }
    };

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), Evaluation4pagesComponent],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: EvaluationService, useValue: evaluationSpy },
        { provide: ActivitiesService, useValue: activitiesSpy },
        { provide: GridsService, useValue: gridsSpy },
        { provide: ClassiService, useValue: classiSpy },
        { provide: ToasterService, useValue: toasterSpy },
        { provide: ModalController, useValue: modalSpy },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        FormBuilder,
        UnsubscribeService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Evaluation4pagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
