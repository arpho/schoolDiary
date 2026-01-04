import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EditEvaluationPage } from './edit-evaluation.page';
import { IonicModule } from '@ionic/angular';
import { ModalController, AlertController } from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';
import { ClassiService } from '../../classes/services/classi.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { ActivitiesService } from '../../activities/services/activities.service';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { EvaluationService } from '../services/evaluation/evaluation.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { EvaluateGridComponent } from '../components/evaluateGrid/evaluate-grid/evaluate-grid.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EditEvaluationPage', () => {
  let component: EditEvaluationPage;
  let fixture: ComponentFixture<EditEvaluationPage>;

  const classiSpy = jasmine.createSpyObj('ClassiService', ['fetchClasseOnCache']);
  const modalSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);
  const usersSpy = jasmine.createSpyObj('UsersService', ['fetchUserOnCache', 'getLoggedUser']);
  const activitiesSpy = jasmine.createSpyObj('ActivitiesService', ['addActivity', 'getActivities4teacherOnRealtime']);
  const gridsSpy = jasmine.createSpyObj('GridsService', ['getGridsOnRealtime']);
  const evaluationSpy = jasmine.createSpyObj('EvaluationService', ['fetchEvaluation', 'updateEvaluation']);
  const toasterSpy = jasmine.createSpyObj('ToasterService', ['presentToast']);
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  const alertSpy = jasmine.createSpyObj('AlertController', ['create']);

  beforeEach(waitForAsync(() => {
    // Setup default returns
    evaluationSpy.fetchEvaluation.and.returnValue(Promise.resolve({}));
    usersSpy.fetchUserOnCache.and.returnValue(Promise.resolve({}));
    
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), EditEvaluationPage],
      providers: [
        { provide: ClassiService, useValue: classiSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: UsersService, useValue: usersSpy },
        { provide: ActivitiesService, useValue: activitiesSpy },
        { provide: GridsService, useValue: gridsSpy },
        { provide: EvaluationService, useValue: evaluationSpy },
        { provide: ToasterService, useValue: toasterSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AlertController, useValue: alertSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => 'eval123' },
              queryParams: {}
            }
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditEvaluationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
