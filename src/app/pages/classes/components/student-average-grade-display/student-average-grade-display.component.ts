import { Component, OnInit, effect, inject, input, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EvaluationService } from '../../../evaluations/services/evaluation/evaluation.service';
import { 
  IonBadge, 
  IonCard, 
  IonCardContent, 
  IonIcon
} from "@ionic/angular/standalone";
@Component({
  selector: 'app-student-average-grade-display',
  templateUrl: './student-average-grade-display.component.html',
  styleUrls: ['./student-average-grade-display.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    IonBadge,
    IonCard,
    IonCardContent,
    IonIcon
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
      this.$evaluations.fetchAverageGradeWhitCount4StudentAndTeacher(this.studentkey(), this.teacherkey(), (result: {averageGrade: number, evaluationscount: number}) => {
        console.log("got averageGrade#", result.averageGrade)
        this.averagegrade.set(result.averageGrade);
        console.log("got evaluationscount#", result.evaluationscount)
        this.evaluationscount.set(result.evaluationscount);
      });
    }); 
  }

  ngOnInit() {}

}
