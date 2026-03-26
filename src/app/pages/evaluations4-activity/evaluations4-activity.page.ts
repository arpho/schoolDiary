import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonNote, IonIcon, IonButton, ActionSheetController, AlertController, ToastController, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ActivityModel } from '../activities/models/activityModel';
import { ActivitiesService } from '../activities/services/activities.service';
import { EvaluationService } from '../evaluations/services/evaluation/evaluation.service';
import { UsersService } from '../../shared/services/users.service';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { addIcons } from 'ionicons';
import { eye, link, create, archive, trash, print, close } from 'ionicons/icons';

@Component({
  selector: 'app-evaluations4-activity',
  templateUrl: './evaluations4-activity.page.html',
  styleUrls: ['./evaluations4-activity.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonNote, 
    IonIcon, 
    IonButton,
    IonButtons,
    IonBackButton,
    CommonModule, 
    FormsModule
  ]
})
export class Evaluations4ActivityPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private activityService = inject(ActivitiesService);
  private evaluationService = inject(EvaluationService);
  private usersService = inject(UsersService);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  activityKey: string | null = null;
  activity = signal<ActivityModel | null>(null);
  evaluations = signal<any[]>([]);
  private unsubscribe: any;

  constructor() {
    addIcons({ eye, link, create, archive, trash, print, close });
  }

  ngOnInit() {
    this.activityKey = this.route.snapshot.paramMap.get('activityKey');
    if (this.activityKey) {
      this.fetchActivity();
      this.fetchEvaluations();
    }
  }

  private fetchActivity() {
    this.activityService.fetchActivityOnCache(this.activityKey!).then((activity: ActivityModel | undefined) => {
      if (activity) {
        this.activity.set(activity);
      }
    });
  }

  private fetchEvaluations() {
    const query = [new QueryCondition('activityKey', '==', this.activityKey)];
    this.unsubscribe = this.evaluationService.getEvaluationsOnRealtime(async (evaluations) => {
      const evaluationsWithNames = await Promise.all(evaluations.map(async (e) => {
        const student = await this.usersService.fetchUserOnCache(e.studentKey);
        return {
          ...e,
          studentName: student ? `${student.lastName} ${student.firstName}` : 'Studente sconosciuto',
          voto: e.voto,
          votoMax: e.votoMax,
          gradeInDecimal: e.gradeInDecimal
        };
      }));
      // Sort by student name
      evaluationsWithNames.sort((a, b) => a.studentName.localeCompare(b.studentName));
      this.evaluations.set(evaluationsWithNames);
    }, query);
  }

  async openActionSheet(evaluation: any, event: Event) {
    event.stopPropagation();
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Azioni valutazione',
      buttons: [
        {
          text: 'Modifica',
          icon: 'create',
          handler: () => {
            this.editEvaluation(evaluation);
            actionSheet.dismiss();
            return false;
          }
        },
        {
          text: 'Archivia',
          icon: 'archive',
          handler: () => {
            this.archiveEvaluation(evaluation);
            actionSheet.dismiss();
            return false;
          }
        },
        {
          text: 'Elimina',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.confirmDelete(evaluation);
            actionSheet.dismiss();
            return false;
          }
        },
        {
          text: 'Esporta in PDF',
          icon: 'print',
          handler: () => {
            this.evaluationPdf(evaluation);
            actionSheet.dismiss();
            return false;
          }
        },
        {
          text: 'Annulla',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            actionSheet.dismiss();
            return false;
          }
        }
      ]
    });

    await actionSheet.present();
  }

  editEvaluation(evaluation: any) {
    this.router.navigate(['/edit-evaluation', evaluation.key]);
  }

  archiveEvaluation(evaluation: any) {
    console.log("archiveEvaluation chiamato", evaluation);
    // Logica di archiviazione se necessaria
  }

  async confirmDelete(evaluation: any) {
    const alert = await this.alertCtrl.create({
      header: 'Conferma eliminazione',
      message: `Sei sicuro di voler eliminare la valutazione per lo studente ${evaluation.studentName}?`,
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: () => {
            this.deleteEvaluation(evaluation);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteEvaluation(evaluation: any) {
    try {
      await this.evaluationService.deleteEvaluation(evaluation);
      // Il signal si aggiornerà automaticamente se c'è un listener realtime, 
      // altrimenti dovremmo aggiornarlo manualmente.
      // Dato che fetchEvaluations usa getEvaluationsOnRealtime, si dovrebbe aggiornare.
      this.showToast('Valutazione eliminata con successo');
    } catch (error) {
      console.error('Errore durante l\'eliminazione della valutazione:', error);
      this.showToast('Si è verificato un errore durante l\'eliminazione', 'danger');
    }
  }

  evaluationPdf(evaluation: any) {
    this.router.navigate(['/pdf-evaluation', evaluation.key]);
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
