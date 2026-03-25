import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonNote, IonIcon, IonButton } from '@ionic/angular/standalone';
import { ActivityModel } from '../activities/models/activityModel';
import { ActivitiesService } from '../activities/services/activities.service';
import { EvaluationService } from '../evaluations/services/evaluation/evaluation.service';
import { UsersService } from '../../shared/services/users.service';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { addIcons } from 'ionicons';
import { eye, link } from 'ionicons/icons';

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
    CommonModule, 
    FormsModule
  ]
})
export class Evaluations4ActivityPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private activityService = inject(ActivitiesService);
  private evaluationService = inject(EvaluationService);
  private usersService = inject(UsersService);

  activityKey: string | null = null;
  activity = signal<ActivityModel | null>(null);
  evaluations = signal<any[]>([]);
  private unsubscribe: any;

  constructor() {
    addIcons({ eye, link });
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

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
