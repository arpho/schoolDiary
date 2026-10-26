import { Component, OnInit, inject, signal, computed, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
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
  ActionSheetController, 
  AlertController, 
  ToastController, 
  IonButtons, 
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonProgressBar
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ActivityModel } from '../activities/models/activityModel';
import { ActivitiesService } from '../activities/services/activities.service';
import { EvaluationService } from '../evaluations/services/evaluation/evaluation.service';
import { UsersService } from '../../shared/services/users.service';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { addIcons } from 'ionicons';
import { eye, link, create, archive, trash, print, close, listOutline, statsChartOutline } from 'ionicons/icons';

export interface IndicatorStat {
  descrizione: string;
  count: number;
  avgVoto: number;
  valoreMax: number;
  percentage: number;
}

@Component({
  selector: 'app-evaluations4-activity',
  templateUrl: './evaluations4-activity.page.html',
  styleUrls: ['./evaluations4-activity.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
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
    IonSegment,
    IonSegmentButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonProgressBar,
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
  selectedSegment = signal<'list' | 'stats'>('list');
  private unsubscribe: any;

  // Statistiche calcolate
  averageGrade = computed(() => {
    const list = this.evaluations();
    const valid = list.filter(e => typeof e.gradeInDecimal === 'number' && !isNaN(e.gradeInDecimal));
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, curr) => acc + curr.gradeInDecimal, 0);
    return sum / valid.length;
  });

  maxGrade = computed(() => {
    const list = this.evaluations();
    const valid = list.filter(e => typeof e.gradeInDecimal === 'number' && !isNaN(e.gradeInDecimal));
    if (valid.length === 0) return 0;
    return Math.max(...valid.map(e => e.gradeInDecimal));
  });

  minGrade = computed(() => {
    const list = this.evaluations();
    const valid = list.filter(e => typeof e.gradeInDecimal === 'number' && !isNaN(e.gradeInDecimal));
    if (valid.length === 0) return 0;
    return Math.min(...valid.map(e => e.gradeInDecimal));
  });

  indicatorStats = computed<IndicatorStat[]>(() => {
    const list = this.evaluations();
    const indicatorMap = new Map<string, { totalVoto: number; count: number; valoreMax: number }>();

    for (const ev of list) {
      const indicatori = ev?.grid?.indicatori;
      if (Array.isArray(indicatori)) {
        for (const ind of indicatori) {
          const key = ind.descrizione?.trim() || 'Indicatore senza descrizione';
          const voto = Number(ind.voto) || 0;
          const maxVal = Number(ind.valore) || 0;

          if (!indicatorMap.has(key)) {
            indicatorMap.set(key, { totalVoto: 0, count: 0, valoreMax: maxVal });
          }
          const item = indicatorMap.get(key)!;
          item.totalVoto += voto;
          item.count += 1;
          if (maxVal > item.valoreMax) {
            item.valoreMax = maxVal;
          }
        }
      }
    }

    const result: IndicatorStat[] = [];
    indicatorMap.forEach((val, descrizione) => {
      const avgVoto = val.count > 0 ? val.totalVoto / val.count : 0;
      const percentage = val.valoreMax > 0 ? (avgVoto / val.valoreMax) * 100 : 0;
      result.push({
        descrizione,
        count: val.count,
        avgVoto,
        valoreMax: val.valoreMax,
        percentage
      });
    });

    return result;
  });

  constructor() {
    addIcons({ eye, link, create, archive, trash, print, close, listOutline, statsChartOutline });
  }

  onSegmentChange(event: any) {
    if (event?.detail?.value) {
      this.selectedSegment.set(event.detail.value);
    }
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
