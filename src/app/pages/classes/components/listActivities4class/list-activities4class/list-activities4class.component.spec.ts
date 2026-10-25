import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListActivities4classComponent } from './list-activities4class.component';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { ActionSheetController, ModalController, AlertController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';

describe('ListActivities4classComponent', () => {
  let component: ListActivities4classComponent;
  let fixture: ComponentFixture<ListActivities4classComponent>;
  let activitiesServiceMock: jasmine.SpyObj<ActivitiesService>;
  let modalCtrlMock: jasmine.SpyObj<ModalController>;
  let toastCtrlMock: jasmine.SpyObj<ToastController>;

  beforeEach(async () => {
    activitiesServiceMock = jasmine.createSpyObj('ActivitiesService', [
      'getActivities4teacherOnRealtime',
      'getActivity',
      'updateActivity',
      'addActivity',
      'deleteActivity'
    ]);
    activitiesServiceMock.getActivities4teacherOnRealtime.and.returnValue(() => {});

    modalCtrlMock = jasmine.createSpyObj('ModalController', ['create']);
    toastCtrlMock = jasmine.createSpyObj('ToastController', ['create']);
    toastCtrlMock.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
    } as any));

    await TestBed.configureTestingModule({
      imports: [ListActivities4classComponent],
      providers: [
        { provide: ActivitiesService, useValue: activitiesServiceMock },
        { provide: UsersService, useValue: { getLoggedUser: jasmine.createSpy('getLoggedUser').and.returnValue(Promise.resolve(null)) } },
        { provide: SubjectService, useValue: { fetchSubjectsByKeys: jasmine.createSpy('fetchSubjectsByKeys').and.returnValue(Promise.resolve([])) } },
        { provide: ActionSheetController, useValue: jasmine.createSpyObj('ActionSheetController', ['create']) },
        { provide: ModalController, useValue: modalCtrlMock },
        { provide: AlertController, useValue: jasmine.createSpyObj('AlertController', ['create']) },
        { provide: ToastController, useValue: toastCtrlMock },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListActivities4classComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('classkey', 'test-class');
    fixture.componentRef.setInput('teacherkey', 'test-teacher');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should persist modified activity via ActivitiesService.updateActivity when edit modal returns data', async () => {
    const original = new ActivityModel({
      key: 'act-1',
      title: 'Titolo iniziale',
      description: 'Descrizione iniziale valida',
      classKey: 'test-class',
      teacherKey: 'test-teacher',
      date: '2026-02-01T00:00:00.000Z'
    }).setKey('act-1');

    component.activitieslist.set([original]);
    activitiesServiceMock.getActivity.and.returnValue(Promise.resolve(original));
    activitiesServiceMock.updateActivity.and.returnValue(Promise.resolve());

    const edited = new ActivityModel({
      ...original,
      title: 'Titolo modificato'
    }).setKey('act-1');

    modalCtrlMock.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ data: edited, role: undefined }))
    } as any));

    await (component as any).editActivity(original);

    expect(activitiesServiceMock.updateActivity).toHaveBeenCalledWith('act-1', jasmine.objectContaining({
      key: 'act-1',
      title: 'Titolo modificato'
    }));
    expect(component.activitieslist()[0].title).toBe('Titolo modificato');
  });

  it('should persist new activity via ActivitiesService.addActivity when create modal returns data', async () => {
    const created = new ActivityModel({
      title: 'Nuovo compito',
      description: 'Esercizi pag. 42 e 43',
      classKey: 'test-class',
      teacherKey: 'test-teacher',
      date: '2026-10-25T00:00:00.000Z'
    });
    const saved = new ActivityModel(created).setKey('act-new');
    activitiesServiceMock.addActivity.and.returnValue(Promise.resolve(saved));

    modalCtrlMock.create.and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ data: created, role: undefined }))
    } as any));

    await component.createActivity();

    expect(activitiesServiceMock.addActivity).toHaveBeenCalledTimes(1);
    expect(component.activitieslist()[0].key).toBe('act-new');
  });
});
