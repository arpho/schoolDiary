import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudentAverageGradeDisplayComponent } from './student-average-grade-display.component';

import { EvaluationService } from 'src/app/pages/evaluations/services/evaluation/evaluation.service';
import { of } from 'rxjs';

describe('StudentAverageGradeDisplayComponent', () => {
  let component: StudentAverageGradeDisplayComponent;
  let fixture: ComponentFixture<StudentAverageGradeDisplayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), StudentAverageGradeDisplayComponent],
      providers: [
        { provide: EvaluationService, useValue: { getEvaluations: () => of([]) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentAverageGradeDisplayComponent);
    component = fixture.componentInstance;
    component.student = { key: '123', name: 'Test', surname: 'Student' } as any;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
