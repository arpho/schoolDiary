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

  it('should calculate statistics and indicator statistics correctly', () => {
    component.evaluations.set([
      {
        gradeInDecimal: 8,
        grid: {
          indicatori: [
            { descrizione: 'Correttezza', voto: 8, valore: '10' },
            { descrizione: 'Completezza', voto: 7, valore: '10' }
          ]
        }
      },
      {
        gradeInDecimal: 6,
        grid: {
          indicatori: [
            { descrizione: 'Correttezza', voto: 6, valore: '10' },
            { descrizione: 'Completezza', voto: 5, valore: '10' }
          ]
        }
      }
    ]);

    expect(component.averageGrade()).toBe(7);
    expect(component.maxGrade()).toBe(8);
    expect(component.minGrade()).toBe(6);

    const stats = component.indicatorStats();
    expect(stats.length).toBe(2);

    const correttezza = stats.find(s => s.descrizione === 'Correttezza');
    expect(correttezza).toBeDefined();
    expect(correttezza?.avgVoto).toBe(7);
    expect(correttezza?.percentage).toBe(70);

    const completezza = stats.find(s => s.descrizione === 'Completezza');
    expect(completezza).toBeDefined();
    expect(completezza?.avgVoto).toBe(6);
    expect(completezza?.percentage).toBe(60);
  });
});
