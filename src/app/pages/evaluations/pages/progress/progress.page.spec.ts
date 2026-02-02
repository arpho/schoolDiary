import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressPage } from './progress.page';
import { ActivatedRoute } from '@angular/router';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { of } from 'rxjs';

describe('ProgressPage', () => {
  let component: ProgressPage;
  let fixture: ComponentFixture<ProgressPage>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: (key: string) => 'test-key'
      }
    }
  };

  const mockEvaluationService = {
    getEvaluation4studentAndTeacher: jasmine.createSpy('getEvaluation4studentAndTeacher')
  };

  const mockUsersService = {
    getLoggedUser: jasmine.createSpy('getLoggedUser').and.returnValue(Promise.resolve({ key: 'teacher1', assignedClasses: [] })),
    fetchUser: jasmine.createSpy('fetchUser').and.returnValue(Promise.resolve({ key: 'student1', classes: ['class1'], classKey: 'class1' })),
    getSubjectsByTeacherAndClass: jasmine.createSpy('getSubjectsByTeacherAndClass').and.returnValue(Promise.resolve([]))
  };

  const mockSubjectService = {
    fetchSubjectsByKeys: jasmine.createSpy('fetchSubjectsByKeys').and.returnValue(Promise.resolve([]))
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProgressPage],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: EvaluationService, useValue: mockEvaluationService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: SubjectService, useValue: mockSubjectService }
      ]
    });
    fixture = TestBed.createComponent(ProgressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
