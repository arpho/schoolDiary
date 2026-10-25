import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ActivitiesListPage } from './activities-list.page';
import { UsersService } from '../../../shared/services/users.service';
import { ActivitiesService } from '../services/activities.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { UserModel } from 'src/app/shared/models/userModel';
import { ActivityModel } from '../models/activityModel';


describe('ActivitiesListPage', () => {
  let component: ActivitiesListPage;
  let fixture: ComponentFixture<ActivitiesListPage>;
  let activitiesSpy: jasmine.SpyObj<ActivitiesService>;
  let modalSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getLoggedUser']);
    activitiesSpy = jasmine.createSpyObj('ActivitiesService', [
      'addActivity',
      'updateActivity',
      'getActivity',
      'deleteActivity',
      'getActivities4teacherOnRealtime'
    ]);
    const classiSpy = jasmine.createSpyObj('ClassiService', ['fetchClasseOnCache']);
    const subjectSpy = jasmine.createSpyObj('SubjectService', ['fetchSubjectsByKeys']);
    modalSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);
    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);
    toastSpy.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
    } as any));
    const activatedRouteSpy = {
      queryParams: of({}),
      snapshot: { paramMap: { get: () => '' } }
    };

    // return a promise with a mock user
    usersSpy.getLoggedUser.and.returnValue(Promise.resolve(new UserModel()));

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ActivitiesListPage],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: ActivitiesService, useValue: activitiesSpy },
        { provide: ClassiService, useValue: classiSpy },
        { provide: SubjectService, useValue: subjectSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: ToastController, useValue: toastSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ActivitiesService.updateActivity when editActivity modal dismisses with updated data', async () => {
    const existing = new ActivityModel({
      key: 'act-10',
      title: 'Vecchio titolo',
      description: 'Descrizione esistente valida',
      classKey: 'c1',
      teacherKey: 't1',
      date: '2026-01-15T00:00:00.000Z'
    }).setKey('act-10');

    component.activitiesList.set([existing]);
    activitiesSpy.getActivity.and.returnValue(Promise.resolve(existing));
    activitiesSpy.updateActivity.and.returnValue(Promise.resolve());

    const updated = new ActivityModel({
      ...existing,
      title: 'Nuovo titolo'
    }).setKey('act-10');

    modalSpy.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ data: updated, role: undefined }))
    } as any));

    await component.editActivity(existing);

    expect(activitiesSpy.updateActivity).toHaveBeenCalledWith('act-10', jasmine.objectContaining({
      key: 'act-10',
      title: 'Nuovo titolo'
    }));
    expect(component.activitiesList()[0].title).toBe('Nuovo titolo');
  });
});
