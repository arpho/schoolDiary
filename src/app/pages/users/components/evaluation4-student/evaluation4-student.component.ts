import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  OnInit,
  inject,
  signal
} from '@angular/core';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLabel,
  IonItem,
  IonList
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { EvaluationService } from '../../../../pages/evaluations/services/evaluation/evaluation.service';
import { Evaluation } from 'src/app/pages/evaluations/models/evaluation';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';

@Component({
  selector: 'app-evaluation4-student',
  templateUrl: './evaluation4-student.component.html',
  styleUrls: ['./evaluation4-student.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonLabel,
    IonItem,
    IonList
  ]
})
export class Evaluation4StudentComponent  implements OnInit {
  private $evaluation = inject(EvaluationService);
  private $activities = inject(ActivitiesService);
  
  studentkey = input.required<string>();
  teacherkey = input.required<string>();
  evaluationsList = signal<Evaluation[]>([]);
  activitiesMap = signal<Map<string, ActivityModel>>(new Map());

  constructor() { 
    console.log("Evaluation4StudentComponent constructor chiamato");
    
    // Usa effect per reagire ai signal inputs
    try {
      effect(() => {
        console.log("Effect eseguito!");
        const studentKey = this.studentkey();
        const teacherKey = this.teacherkey();
        console.log("studentKey (from effect)", studentKey);
        console.log("teacherKey (from effect)", teacherKey);
        
        // Chiama il servizio solo quando gli input sono valorizzati
        if (studentKey && teacherKey) {
          console.log("Chiamata a getEvaluation4studentAndTeacher con:", studentKey, teacherKey);
          this.$evaluation.getEvaluation4studentAndTeacher(studentKey, teacherKey, async (evaluations: Evaluation[]) => {
            console.log("evaluations ricevute:", evaluations);
            this.evaluationsList.set(evaluations);
            
            // Pre-carica tutte le attività associate alle valutazioni
            await this.loadActivitiesForEvaluations(evaluations);
          });
        } else {
          console.log("studentKey o teacherKey non ancora valorizzati");
        }
      });
      console.log("Effect registrato con successo");
    } catch (error) {
      console.error("Errore nella registrazione dell'effect:", error);
    }
  }

  ngOnInit() {
    console.log("ngOnInit - studentKey", this.studentkey());
    console.log("ngOnInit - teacherKey", this.teacherkey());
    
    // Prova anche con setTimeout
    setTimeout(() => {
      console.log("setTimeout - studentKey", this.studentkey());
      console.log("setTimeout - teacherKey", this.teacherkey());
    }, 100);
  }

  // Pre-carica tutte le attività per le valutazioni
  private async loadActivitiesForEvaluations(evaluations: Evaluation[]): Promise<void> {
    const activityKeys = evaluations
      .map(e => e.activityKey)
      .filter((key): key is string => !!key);
    
    const uniqueKeys = [...new Set(activityKeys)];
    const activitiesMap = new Map<string, ActivityModel>();
    
    // Carica tutte le attività in parallelo
    await Promise.all(
      uniqueKeys.map(async (key) => {
        const activity = await this.$activities.fetchActivityOnCache(key);
        if (activity) {
          activitiesMap.set(key, activity);
        }
      })
    );
    
    this.activitiesMap.set(activitiesMap);
  }

  // Metodo sincrono per ottenere l'attività dalla cache locale
  getActivity(activityKey: string): ActivityModel | undefined {
    if (!activityKey) return undefined;
    return this.activitiesMap().get(activityKey);
  }

}
