import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Evaluations4StudentPage } from './evaluations4-student.page';
import { provideRouter } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { of } from 'rxjs';
import { UserModel } from 'src/app/shared/models/userModel';
import { EvaluationService } from 'src/app/pages/evaluations/services/evaluation/evaluation.service';
import { Firestore } from '@angular/fire/firestore';

describe('Evaluations4StudentPage', () => {
  let component: Evaluations4StudentPage;
  let fixture: ComponentFixture<Evaluations4StudentPage>;
  let usersServiceMock: any;

  beforeEach(waitForAsync(() => {
    usersServiceMock = {
      getUserByUid: jasmine.createSpy('getUserByUid').and.returnValue(Promise.resolve(new UserModel()))
    };

    TestBed.configureTestingModule({
      imports: [Evaluations4StudentPage],
      providers: [
        provideRouter([]),
        { provide: UsersService, useValue: usersServiceMock },
        { provide: EvaluationService, useValue: { getEvaluation4studentAndTeacher: jasmine.createSpy('getEvaluation4studentAndTeacher'), fetchAverageGradeWhitCount4StudentAndTeacher: jasmine.createSpy('fetchAverageGradeWhitCount4StudentAndTeacher') } },
        { provide: Firestore, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Evaluations4StudentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
