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
   IonList,
   IonIcon,
   IonFab,
   IonFabButton,
   IonFabList,
  ModalController
} from '@ionic/angular/standalone';
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
import { Evaluation2PdfComponent } from 'src/app/pages/evaluations/components/evaluation2-pdf/evaluation2-pdf.component';
import { EvaluationPage } from 'src/app/pages/evaluations/evaluation/evaluation.page';
import { Router } from '@angular/router';

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
  classKey = signal<string>('');
loggedUser = signal<UserModel | null>(null)
  $users = inject(UsersService);
userCanEdit(evaluation: Evaluation) {

return this.loggedUser()?.role! <= UsersRole.TEACHER && evaluation.teacherKey === this.loggedUser()?.key;
}
viewEvaluation(_t12: Evaluation) {
throw new Error('Method not implemented.');
}
  async evaluationPdf(valutazione: Evaluation) {
console.log("evaluationPdf", valutazione);
const modal = await this.modalCtrl.create({
  component: Evaluation2PdfComponent,
  componentProps: {
    evaluation: valutazione,
  },
  cssClass: "fullscreen"
});
await modal.present(); 
}
deleteEvaluation(valutazione: Evaluation) {
console.log("deleteEvaluation chiamato", valutazione);
}
archiveEvaluation(valutazione: Evaluation) {
console.log("archiveEvaluation chiamato", valutazione);
}
async editEvaluation(valutazione: Evaluation) {
console.log("editEvaluation chiamato", valutazione);
this.classKey.set(valutazione.classKey);
this.router.navigate(['/edit-evaluation',valutazione.key]);

}
  private $evaluation = inject(EvaluationService);
  private $activities = inject(ActivitiesService);
  
  studentkey = input.required<string>();
  teacherkey = input.required<string>();
  evaluationsList = signal<Evaluation[]>([]);
  activitiesMap = signal<Map<string, ActivityModel>>(new Map());
  modalCtrl = inject(ModalController);  
  private router = inject(Router);
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

            this.evaluationsList.set(evaluations);
            
            // Pre-carica tutte le attività associate alle valutazioni
            await this.loadActivitiesForEvaluations(evaluations);
          });
         } else {
           // Situazione normale - chiavi non ancora valorizzate
         }
       });
     } catch (error) {
       console.error("Errore nella registrazione dell'effect:", error);
     }
  }

  async ngOnInit() {
    const user = await this.$users.getLoggedUser();
    this.loggedUser.set(user);
    
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
    console.log("activitiesMap", this.activitiesMap());
  }

  // Metodo sincrono per ottenere l'attività dalla cache locale
  getActivity(activityKey: string): ActivityModel | undefined {
    if (!activityKey) return undefined;
    return this.activitiesMap().get(activityKey);
  }

}
