import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Evaluations4ActivityPage } from './evaluations4-activity.page';
import { ActivatedRoute } from '@angular/router';
import { ActivitiesService } from '../activities/services/activities.service';
import { EvaluationService } from '../evaluations/services/evaluation/evaluation.service';
import { UsersService } from '../../shared/services/users.service';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';

describe('Evaluations4ActivityPage', () => {
  let component: Evaluations4ActivityPage;
  let fixture: ComponentFixture<Evaluations4ActivityPage>;

  const activitiesSpy = jasmine.createSpyObj('ActivitiesService', ['fetchActivityOnCache']);
  const evaluationSpy = jasmine.createSpyObj('EvaluationService', ['getEvaluationsOnRealtime']);
  const usersSpy = jasmine.createSpyObj('UsersService', ['fetchUserOnCache']);
  
  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: (key: string) => 'test-activity-key'
      }
    }
  };

  beforeEach(async () => {
    activitiesSpy.fetchActivityOnCache.and.returnValue(Promise.resolve(undefined));
    evaluationSpy.getEvaluationsOnRealtime.and.returnValue(() => {});
    usersSpy.fetchUserOnCache.and.returnValue(Promise.resolve(undefined));

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), Evaluations4ActivityPage],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ActivitiesService, useValue: activitiesSpy },
        { provide: EvaluationService, useValue: evaluationSpy },
        { provide: UsersService, useValue: usersSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Evaluations4ActivityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
