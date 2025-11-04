import { Component, OnInit, effect, inject, input, signal } from '@angular/core';
import { EvaluationsService } from 'src/app/shared/services/evaluations.service';
@Component({
  selector: 'app-student-average-grade-display',
  templateUrl: './student-average-grade-display.component.html',
  styleUrls: ['./student-average-grade-display.component.scss'],
})
export class StudentAverageGradeDisplayComponent  implements OnInit {
  studentkey = input.required<string>();
  averageGrade = signal<number>(0);
  evaluationscount = signal<number>(0);
  teacherkey = input.required<string>();
  $evaluations = inject(EvaluationsService);

  constructor() { 
    effect(() => {
      console.log('StudentAverageGradeDisplayComponent - studentkey cambiato:', this.studentkey());
      this.$evaluations.fetchAverageGrade4StudentAndTeacher(this.studentkey(), (averageGrade: number) => {
        this.averageGrade.set(averageGrade);
      });
      this.$evaluations.fetchEvaluationsCount4Student(this.studentkey(), (evaluationscount: number) => {
        this.evaluationscount.set(evaluationscount);
      });
    }); 
  }

  ngOnInit() {}

}
