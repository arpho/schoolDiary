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
export class StudentAverageGradeDisplayComponent  implements OnInit {
  constructor(
    private router: Router
  ) { 
    effect(() => {
      
      this.$evaluations.fetchAverageGradeWhitCount4StudentAndTeacher(this.student().key, this.teacherkey(), (result: {averageGrade: number, evaluationscount: number}) => {
        this.averagegrade.set(result.averageGrade);
        this.evaluationscount.set(result.evaluationscount);
        this.visibilityStatus.emit({studentKey:this.student().key,visibility:true});
      });
    });
    addIcons({
   clipboardOutline: clipboardOutline,
   statsChart: statsChart,
   documentText: documentText 
  });
}
openEvaluationList(event: Event) {
  event.stopPropagation();
console.log("openEvaluationList for student", this.student().key);
this.router.navigate(['/evaluations4-student', this.student().key,this.teacherkey()]);
}
  student = input.required<UserModel>();
  averagegrade = signal<number>(0);
  visibilityStatus = output<{studentKey:string,visibility:boolean}>();
  evaluationscount = signal<number>(0);
  teacherkey = input.required<string>();
  $evaluations = inject(EvaluationService);
  private sanitizer = inject(DomSanitizer);

  getCardBackground(grade: number): SafeStyle {
    // Calculate color based on grade
    let hue: number;
    let saturation = '95%';
    let lightness = '85%';
    
    if (grade >= 6) {
      // Green for grades >= 6
      // Scale from yellow (60) to green (120) as grade goes from 6 to 10
      hue = 60 + (grade - 6) * 15; // 15 = (120-60)/(10-6)
      saturation = '100%';
    } else if (grade >= 4) {
      // Orange/Yellow for grades between 4 and 6
      // Scale from orange (30) to yellow (60) as grade goes from 4 to 6
      hue = 30 + (grade - 4) * 15; // 15 = (60-30)/(6-4)
      saturation = '100%';
    } else {
      // Red for grades < 4
      hue = 0;
      saturation = '100%';
    }
    
    const color = `hsl(${hue}, ${saturation}, ${lightness})`;
    return this.sanitizer.bypassSecurityTrustStyle(`--background: ${color}`);
  }



  ngOnInit() {}

}
