import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EvaluationsListPage } from './evaluations-list.page';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { IonicModule } from '@ionic/angular';
import { PopoverController, ModalController, AlertController } from '@ionic/angular/standalone';
import { UsersService } from 'src/app/shared/services/users.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FilterPopupComponent } from '../../components/filterPopup/filter-popup/filter-popup.component';
import { EvaluationDialogPage } from '../../evaluation-dialog/evaluation-dialog.page';
import { Evaluation2PdfComponent } from '../../components/evaluation2-pdf/evaluation2-pdf.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EvaluationsListPage', () => {
  let component: EvaluationsListPage;
  let fixture: ComponentFixture<EvaluationsListPage>;

  const evaluationServiceMock = {
    getEvaluationsOnRealtime: jasmine.createSpy('getEvaluationsOnRealtime'),
    getEvaluations: jasmine.createSpy('getEvaluations').and.returnValue(of([]))
  };

  const popoverCtrlMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({ data: null }) })),
    dismiss: jasmine.createSpy('dismiss')
  };

  const usersServiceMock = {
    getLoggedUser: jasmine.createSpy('getLoggedUser').and.returnValue(Promise.resolve({ key: 'teacher1', classesKey: [] })),
    getUsersByClass: jasmine.createSpy('getUsersByClass')
  };

  const classiServiceMock = {
    fetchClasseOnCache: jasmine.createSpy('fetchClasseOnCache')
  };

  const activitiesServiceMock = {
    getActivities4teacherOnRealtime: jasmine.createSpy('getActivities4teacherOnRealtime')
  };

  const modalCtrlMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({ data: null }) })),
    dismiss: jasmine.createSpy('dismiss')
  };
  
  const alertSpy = jasmine.createSpyObj('AlertController', ['create']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), EvaluationsListPage],
      providers: [
        { provide: EvaluationService, useValue: evaluationServiceMock },
        { provide: PopoverController, useValue: popoverCtrlMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: ClassiService, useValue: classiServiceMock },
        { provide: ActivitiesService, useValue: activitiesServiceMock },
        { provide: ModalController, useValue: modalCtrlMock },
        { provide: AlertController, useValue: alertSpy },
        provideRouter([])
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .overrideComponent(EvaluationsListPage, {
      add: { imports: [IonicModule] },
      remove: { imports: [FilterPopupComponent, EvaluationDialogPage, Evaluation2PdfComponent] }
    })
    .compileComponents();


    fixture = TestBed.createComponent(EvaluationsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
