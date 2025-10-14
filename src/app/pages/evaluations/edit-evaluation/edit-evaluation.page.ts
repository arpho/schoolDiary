import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Evaluation } from '../models/evaluation';
import { EvaluationService } from '../services/evaluation/evaluation.service';
@Component({
  selector: 'app-edit-evaluation',
  templateUrl: './edit-evaluation.page.html',
  styleUrls: ['./edit-evaluation.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EditEvaluationPage implements OnInit {
  route = inject(ActivatedRoute);
evaluation = signal<Evaluation | null>(null);
  $evaluation = inject(EvaluationService);
  constructor() { 
    console.log("EditEvaluationPage constructor chiamato")
  }

  async ngOnInit() {

    const evaluationKey = this.route.snapshot.paramMap.get('evaluationKey');
    console.log(evaluationKey);
    if(evaluationKey){
    const evaluation = await this.$evaluation.getEvaluation(evaluationKey);
    this.evaluation.set(evaluation);
    console.log("editing ", evaluation)
    }
    


}
}
