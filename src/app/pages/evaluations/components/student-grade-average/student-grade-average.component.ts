import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-student-grade-display',
  template: `
    <div class="grade-display">
      <h2>COMPONENTE VISIBILE</h2>
      <p class="grade-value">Media voti: 7.5</p>
      <p class="student-id">Student Key: {{studentkey}}</p>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, IonText]
})
export class StudentGradeDisplayComponent {
  @Input() set studentkey(value: string) {
    console.log('StudentGradeAverageComponent - studentkey impostato:', value);
    this._studentkey = value;
  }
  get studentkey(): string {
    return this._studentkey;
  }
  private _studentkey: string = '';
  
  // Per debug
  constructor() {
    console.log('StudentGradeAverageComponent - Costruttore chiamato');
    console.log('Student ID atteso:', this.studentkey);
    
    // Forza un cambio rilevamento dopo un breve ritardo
    setTimeout(() => {
      console.log('StudentGradeAverageComponent - Dopo timeout, studentkey:', this.studentkey);
    }, 1000);
  }
}
