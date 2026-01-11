import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EvaluationDialogPage } from './evaluation-dialog.page';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { EvaluationService } from '../services/evaluation/evaluation.service';
import { ClassiService } from '../../classes/services/classi.service';
import { ModalController, IonicModule } from '@ionic/angular';
import { AlertController } from '@ionic/angular/standalone';
import { of } from 'rxjs';

describe('EvaluationDialogPage', () => {
  let component: EvaluationDialogPage;
  let fixture: ComponentFixture<EvaluationDialogPage>;

  const toasterSpy = jasmine.createSpyObj('ToasterService', ['presentToast']);
  const activitiesSpy = jasmine.createSpyObj('ActivitiesService', ['getActivities4teacherOnRealtime', 'addActivity']);
  const usersSpy = jasmine.createSpyObj('UsersService', ['getLoggedUser']);
  const gridsSpy = jasmine.createSpyObj('GridsService', ['getGridsOnRealtime']);
  const evaluationSpy = jasmine.createSpyObj('EvaluationService', ['fetchEvaluation', 'updateEvaluation', 'addEvaluation']);
  const classesSpy = jasmine.createSpyObj('ClassiService', ['fetchClasseOnCache']);

  const modalSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
  const alertSpy = jasmine.createSpyObj('AlertController', ['create']);

  beforeEach(waitForAsync(() => {
    // Setup default mock returns
    usersSpy.getLoggedUser.and.returnValue(Promise.resolve({ key: 'teacher1', classesKey: [] }));
    modalSpy.create.and.returnValue(Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({ data: null }) }));

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), EvaluationDialogPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, queryParams: {} } } },
        { provide: ToasterService, useValue: toasterSpy },
        { provide: ActivitiesService, useValue: activitiesSpy },
        { provide: UsersService, useValue: usersSpy },
        { provide: GridsService, useValue: gridsSpy },
        { provide: EvaluationService, useValue: evaluationSpy },
        { provide: ClassiService, useValue: classesSpy },
        { provide: ClassiService, useValue: classesSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: AlertController, useValue: alertSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationDialogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
