import { Component, OnInit, effect, inject, input, signal } from '@angular/core';
import { EvaluationService } from '../../../evaluations/services/evaluation/evaluation.service';
import { IonBadge, IonItem, IonLabel } from "@ionic/angular/standalone";
@Component({
  selector: 'app-student-average-grade-display',
  templateUrl: './student-average-grade-display.component.html',
  styleUrls: ['./student-average-grade-display.component.scss'],
  imports: [
    IonBadge,
    IonItem,
    IonLabel
  ],
})
export class StudentAverageGradeDisplayComponent  implements OnInit {
  studentkey = input.required<string>();
  averagegrade = signal<number>(0);
  evaluationscount = signal<number>(0);
  teacherkey = input.required<string>();
  $evaluations = inject(EvaluationService);

  constructor() { 
    effect(() => {
      console.log('StudentAverageGradeDisplayComponent - studentkey cambiato:', this.studentkey());
      this.$evaluations.fetchAverageGrade4StudentAndTeacher(this.studentkey(), this.teacherkey(), (averageGrade: number) => {
        console.log("got averageGrade#", averageGrade)
        this.averagegrade.set(averageGrade);
      });
      this.$evaluations.fetchEvaluationsCount4Student(this.studentkey(), this.teacherkey(), (evaluationscount: number) => {
        console.log("got evaluationscount#",evaluationscount)
        this.evaluationscount.set(evaluationscount);
      });
    }); 
  }

  ngOnInit() {}

}
