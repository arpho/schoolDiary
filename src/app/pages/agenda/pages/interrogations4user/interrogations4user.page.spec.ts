import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Interrogations4userPage } from './interrogations4user.page';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { ModalController, AlertController } from '@ionic/angular/standalone';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { of } from 'rxjs';

describe('Interrogations4userPage', () => {
  let component: Interrogations4userPage;
  let fixture: ComponentFixture<Interrogations4userPage>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => 'test-student-key'
      }
    }
  };

  const mockUsersService = {
    getUser: jasmine.createSpy('getUser').and.returnValue(Promise.resolve({ key: 'test', firstName: 'Test', lastName: 'User', classKey: 'test-class' })),
    getUsersOnRealTime: jasmine.createSpy('getUsersOnRealTime').and.returnValue(() => {})
  };

  const mockSubjectService = {
    fetchSubjectsByKeys: jasmine.createSpy('fetchSubjectsByKeys').and.returnValue(Promise.resolve([])),
    getSubjectsOnRealtime: jasmine.createSpy('getSubjectsOnRealtime').and.returnValue(of([]))
  };

  const mockAgendaService = {
    getAgenda4targetedClassesOnrealtime: jasmine.createSpy('getAgenda4targetedClassesOnrealtime').and.returnValue(() => {})
  };

  const mockModalController = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: () => Promise.resolve() }))
  };

  const mockAlertController = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: () => Promise.resolve() }))
  };

  const mockToasterService = {
    showToast: jasmine.createSpy('showToast')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Interrogations4userPage],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: UsersService, useValue: mockUsersService },
        { provide: SubjectService, useValue: mockSubjectService },
        { provide: AgendaService, useValue: mockAgendaService },
        { provide: ModalController, useValue: mockModalController },
        { provide: AlertController, useValue: mockAlertController },
        { provide: ToasterService, useValue: mockToasterService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Interrogations4userPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
