import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, IonItem, IonList, IonIcon, IonFab, IonFabButton, IonFabList } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { EvaluationService } from '../../../../pages/evaluations/services/evaluation/evaluation.service';
import { Evaluation } from 'src/app/pages/evaluations/models/evaluation';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';
import { addIcons } from 'ionicons';
import { eyeOutline, print, ellipsisVertical, create, archive, trash, close } from 'ionicons/icons';
import { UsersRole } from 'functions/src/shared/models/UsersRole';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';

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
    IonList,
    IonIcon,
    IonFab,
    IonFabButton,
    IonFabList
]
})
export class Evaluation4StudentComponent  implements OnInit {
loggedUser = signal<UserModel | null>(null)
  $users = inject(UsersService);
userCanEdit(evaluation: Evaluation) {
console.log("userCanEdit chiamato", evaluation);
console.log("loggedUser", this.loggedUser());
console.log("evaluation teacherKey", evaluation.teacherKey);
console.log("this.loggedUser()?.key", this.loggedUser()?.key);
return this.loggedUser()?.role! <= UsersRole.TEACHER && evaluation.teacherKey === this.loggedUser()?.key;
}
viewEvaluation(_t12: Evaluation) {
throw new Error('Method not implemented.');
}
evaluationPdf(valutazione: Evaluation) {
console.log("evaluationPdf chiamato", valutazione);
}
deleteEvaluation(valutazione: Evaluation) {
console.log("deleteEvaluation chiamato", valutazione);
}
archiveEvaluation(valutazione: Evaluation) {
console.log("archiveEvaluation chiamato", valutazione);
}
editEvaluation(valutazione: Evaluation) {
console.log("editEvaluation chiamato", valutazione);
}
  private $evaluation = inject(EvaluationService);
  private $activities = inject(ActivitiesService);
  
  studentkey = input.required<string>();
  teacherkey = input.required<string>();
  evaluationsList = signal<Evaluation[]>([]);
  activitiesMap = signal<Map<string, ActivityModel>>(new Map());

  constructor() { 
    console.log("Evaluation4StudentComponent constructor chiamato");
    this.ngOnInit()
    addIcons({
      eyeOutline: eyeOutline,
      print: print,
      ellipsisVertical: ellipsisVertical,
      create: create,
      archive: archive,
      trash: trash,
      close: close,
    });
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
            console.log("Numero valutazioni:", evaluations.length);
            evaluations.forEach((evaluation, index) => {
              console.log(`Valutazione ${index}:`, evaluation);
              console.log(`  - activityKey: ${evaluation.activityKey}`);
              console.log(`  - voto: ${evaluation.voto}`);
              console.log(`  - votoMax: ${evaluation.votoMax}`);
              console.log(`  - voto type: ${typeof evaluation.voto}`);
              console.log(`  - votoMax type: ${typeof evaluation.votoMax}`);
              console.log(`  - voto is 0: ${evaluation.voto === 0}`);
              console.log(`  - votoMax is 0: ${evaluation.votoMax === 0}`);
              console.log(`  - grid.voto: ${evaluation.grid.voto}`);
              console.log(`  - grid.votoMax: ${evaluation.grid.votoMax}`);
              console.log(`  - grid.key: ${evaluation.grid.key}`);
              console.log(`  - grid.nome: ${evaluation.grid.nome}`);
              console.log(`  - grid.indicatori length: ${evaluation.grid.indicatori.length}`);
              if (evaluation.grid.indicatori.length > 0) {
                console.log(`  - primo indicatore: ${JSON.stringify(evaluation.grid.indicatori[0])}`);
              }
            });
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

  async ngOnInit() {
    console.log("ngOnInit - studentKey", this.studentkey());
    console.log("ngOnInit - teacherKey", this.teacherkey());
    const user = await this.$users.getLoggedUser();
    this.loggedUser.set(user);
    console.log("ngOnInit - loggedUser", this.loggedUser());
    
    // Prova anche con setTimeout

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
