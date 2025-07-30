import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,
   IonList,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonIcon,
  IonFabList,
  IonButtons,
  IonBackButton,
  IonButton,
  IonBadge,
  ModalController,
  PopoverController } from '@ionic/angular/standalone';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { Evaluation } from '../../models/evaluation';
import { addIcons } from 'ionicons';
import {
   create,
   archive,
   ellipsisVertical,
   trash,
   close,
   print,
   filter } from 'ionicons/icons';
import { EvaluationDialogPage } from '../../evaluation-dialog/evaluation-dialog.page';
import { Evaluation2PdfComponent } from '../../components/evaluation2-pdf/evaluation2-pdf.component';
import { FilterPopupComponent } from '../../components/filterPopup/filter-popup/filter-popup.component';                     
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ActivityModel } from "../../../activities/models/activityModel";
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { UsersRole } from 'src/app/shared/models/usersRole';
@Component({
  selector: 'app-evaluations-list',
  templateUrl: './evaluations-list.page.html',
  styleUrls: ['./evaluations-list.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonFab,
    IonFabButton,
    IonIcon,
    IonFabList,
    DatePipe,
    IonButtons,
    IonBackButton,
    IonButton,
    IonBadge,
    
]
})
export class EvaluationsListPage implements OnInit {
  filterSignal = signal<QueryCondition[]>([])
  listaClassi = signal<ClasseModel[]>([])
  listaStudenti = signal<UserModel[]>([])
  listaAttivita = signal<ActivityModel[]>([])
  loggedUser = signal<UserModel | null>(null)
  constructor(
    private $service: EvaluationService,
    private popOverCtrl: PopoverController,
    private $users: UsersService,
    private $classi: ClassiService,
    private $activities: ActivitiesService
  ) { 
    addIcons({
      create,
      archive,
      ellipsisVertical,
      trash,
      close,
      print,
      filter
    });

    effect(() => {
      if (this.filterSignal().filter((condition: QueryCondition) => condition.field === 'classKey').length > 0) {
        const classKey = this.filterSignal().filter((condition: QueryCondition) => condition.field === 'classKey')[0].value;
        const queryConditions: QueryCondition[] = [new QueryCondition('classKey', '==', classKey)];
        const user = this.loggedUser();
        if (user) {// aggiorno le attività per la classe selezionata
          this.$activities.getActivitiesOnRealtime(user.key, (activities: ActivityModel[]) => {
            console.log("activities", activities);
            this.listaAttivita.set(activities);
          }, queryConditions);
        }
        // aggiorno la lista studenti per classe
        this.$users.getUsersByClass(classKey, (students: UserModel[]) => {
          console.log("students", students);
          this.listaStudenti.set(students);
        }, [new QueryCondition('role', '==', UsersRole.STUDENT)]);
      }
    })
  }

  badgefilter = computed(() => this.filterSignal().length);
  async openFilterPopup(event: Event) {
    console.log('Opening filter popup');
 const popover = await this.popOverCtrl.create({
  component: FilterPopupComponent,
  event,
  translucent: true,
  componentProps: {
    filter: this.filterSignal,
    listaClassi: this.listaClassi,
    listaAttivita: this.listaAttivita,
    listaStudenti: this.listaStudenti
  }
});
await popover.present();
}

  async evaluationPdf(valutazione: Evaluation) {
console.log("evaluationPdf", valutazione);
const modal = await this.modalCtrl.create({
  component: Evaluation2PdfComponent,
  componentProps: {
    evaluation: valutazione
  }
});
await modal.present(); 
}
  evaluationsList = signal<Evaluation[]>([]);

  private modalCtrl = inject(ModalController);


  async ngOnInit() {
    const user = await this.$users.getLoggedUser();
    this.loggedUser.set(user);
    console.log("user", user)
    if(user?.classesKey){
      const classi = user.classesKey.map(classKey => this.$classi.fetchClasseOnCache(classKey))
      .filter((classe): classe is ClasseModel => classe !== undefined);
      this.listaClassi.set(classi);
      console.log("classi", classi)
      this.listaClassi.set(classi);
       const activitiesQuery: QueryCondition[] = [];
     
       this.$activities.getActivitiesOnRealtime(user?.key, (activities: ActivityModel[]) => {
        console.log("activities", activities);
        this.listaAttivita.set(activities);
       })
    }
    this.$service.getEvaluationsOnRealtime((evaluations: Evaluation[]) => {
      console.log("evaluations", evaluations);
      this.evaluationsList.set(evaluations);
    });
  }

  async editEvaluation(evaluation: Evaluation) {
    // Implement edit logic
    console.log('Editing evaluation:', evaluation);
    const modal = await this.modalCtrl.create({
      component: EvaluationDialogPage,
      componentProps: {
        evaluation: evaluation
      },
      cssClass: "fullscreen"
    });
    await modal.present();
  }

  archiveEvaluation(evaluation: Evaluation) {
    // Implement archive logic
    console.log('Archiving evaluation:', evaluation);
  }

  deleteEvaluation(evaluation: Evaluation) {
    // Implement delete logic
    console.log('Deleting evaluation:', evaluation);
  }
}
