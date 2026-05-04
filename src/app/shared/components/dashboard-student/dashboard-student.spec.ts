import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardStudentComponent } from './dashboard-student';
import { UsersService } from 'src/app/shared/services/users.service';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { EvaluationService } from 'src/app/pages/evaluations/services/evaluation/evaluation.service';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { GroupsService } from 'src/app/pages/classes/services/groups/groups.service';
import { of } from 'rxjs';
import { IonicModule } from '@ionic/angular';

describe('DashboardStudentComponent', () => {
  let component: DashboardStudentComponent;
  let fixture: ComponentFixture<DashboardStudentComponent>;

  const mockUsersService = {
    getLoggedUser: jasmine.createSpy('getLoggedUser').and.returnValue(Promise.resolve({ key: 'student1', classKey: 'class1' })),
    getUsersOnRealTime: jasmine.createSpy('getUsersOnRealTime').and.returnValue(() => {}),
    getSubjectsByTeacherAndClass: jasmine.createSpy('getSubjectsByTeacherAndClass').and.returnValue(Promise.resolve([]))
  };

  const mockActivitiesService = {
    fetchActivitiesOnRealTime: jasmine.createSpy('fetchActivitiesOnRealTime').and.returnValue(() => {})
  };

  const mockEvaluationService = {
    getEvaluationsOnRealtime: jasmine.createSpy('getEvaluationsOnRealtime').and.returnValue(() => {})
  };

  const mockAgendaService = {
    getAgenda4targetedClassesOnrealtime: jasmine.createSpy('getAgenda4targetedClassesOnrealtime').and.returnValue(() => {})
  };

  const mockSubjectService = {
    fetchSubjectsByKeys: jasmine.createSpy('fetchSubjectsByKeys').and.returnValue(Promise.resolve([]))
  };

  const mockGroupsService = {
    fetchStudentGroup: jasmine.createSpy('fetchStudentGroup').and.returnValue(Promise.resolve(null))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), DashboardStudentComponent],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: ActivitiesService, useValue: mockActivitiesService },
        { provide: EvaluationService, useValue: mockEvaluationService },
        { provide: AgendaService, useValue: mockAgendaService },
        { provide: SubjectService, useValue: mockSubjectService },
        { provide: GroupsService, useValue: mockGroupsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
