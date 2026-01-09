import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

/**
 * Componente placeholder per la lista valutazioni studente (probabilmente non utilizzato o incompleto).
 */
@Component({
  selector: 'app-evaluations-list4-student',
  templateUrl: './evaluations-list4-student.page.html',
  styleUrls: ['./evaluations-list4-student.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EvaluationsList4StudentPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
