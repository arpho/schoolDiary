import { Component, OnInit, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { EvaluationService } from '../../../evaluations/services/evaluation/evaluation.service';
import { 
  IonBadge, 
  IonCard, 
  IonCardContent, 
  IonIcon
} from "@ionic/angular/standalone";
import { UserModel } from 'src/app/shared/models/userModel';
import { filter } from 'rxjs';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { clipboardOutline, documentText, statsChart } from 'ionicons/icons';
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
export class StudentAverageGradeDisplayComponent implements OnInit {
  student = input.required<UserModel>();
  teacherkey = input.required<string>();
  subjectKey = input<string>('all');
  
  averagegrade = signal<number>(0);
  evaluationscount = signal<number>(0);
  visibilityStatus = output<{studentKey:string,visibility:boolean}>();

  $evaluations = inject(EvaluationService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  constructor() { 
    effect(() => {
      const subject = this.subjectKey() === 'all' ? undefined : this.subjectKey();
      this.$evaluations.fetchAverageGradeWhitCount4StudentAndTeacher(
        this.student().key, 
        this.teacherkey(), 
        (result: {averageGrade: number, evaluationscount: number}) => {
          this.averagegrade.set(result.averageGrade);
          this.evaluationscount.set(result.evaluationscount);
          this.visibilityStatus.emit({studentKey:this.student().key,visibility:true});
        }, 
        subject
      );
    });

    addIcons({
      clipboardOutline,
      statsChart,
      documentText 
    });
  }

  openEvaluationList(event: Event) {
    event.stopPropagation();
    console.log("openEvaluationList for student", this.student().key);
    this.router.navigate(['/evaluations4-student', this.student().key, this.teacherkey()]);
  }

  getCardBackground(grade: number): SafeStyle {
    let hue: number;
    let saturation = '95%';
    let lightness = '85%';
    
    if (grade >= 6) {
      hue = 60 + (grade - 6) * 15;
      saturation = '100%';
    } else if (grade >= 4) {
      hue = 30 + (grade - 4) * 15;
      saturation = '100%';
    } else {
      hue = 0;
      saturation = '100%';
    }
    
    const color = `hsl(${hue}, ${saturation}, ${lightness})`;
    return this.sanitizer.bypassSecurityTrustStyle(`--background: ${color}`);
  }

  ngOnInit() {}
}
