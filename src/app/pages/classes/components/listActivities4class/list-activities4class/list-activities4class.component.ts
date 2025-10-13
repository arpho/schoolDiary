import { Component, OnInit, OnDestroy, effect, model } from '@angular/core';
import { input, signal } from '@angular/core';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { DatePipe } from '@angular/common';
import { IonList, IonItem, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-list-activities4class',
  templateUrl: './list-activities4class.component.html',
  styleUrls: ['./list-activities4class.component.scss'],
  standalone: true,
  imports: [
    DatePipe,
    IonList,
    IonItem,
    IonLabel
  ]
})
export class ListActivities4classComponent {
  classkey = input<string>('');
  teacherkey = input<string>('');
  activitieslist = signal<ActivityModel[]>([]);

  constructor(
    private activitiesService: ActivitiesService
  ) {
    // Effetto che si attiva quando i valori cambiano
    effect(() => {
      const currentClassKey = this.classkey();
      const currentTeacherKey = this.teacherkey();
      
      if (currentClassKey && currentTeacherKey) {
        this.updateActivities();
      }
    });
  }

  private updateActivities() {
    const currentClassKey = this.classkey();
    const currentTeacherKey = this.teacherkey();
    
    if (!currentClassKey || !currentTeacherKey) {
      return;
    }

    console.log("classkey**", currentClassKey);
    console.log("teacherkey**", currentTeacherKey);

    // Creo le condizioni di query
    const query: QueryCondition[] = [
      new QueryCondition('classKey', '==', currentClassKey),
      new QueryCondition('teacherKey', '==', currentTeacherKey)
    ];

    // Sottoscrivo al servizio getActivitiesOnRealtime
    this.activitiesService.getActivities4teacherOnRealtime(
      currentTeacherKey,
      (activities: ActivityModel[]) => {
        this.activitieslist.set(activities);
      },
      query
    );
  }

  ngOnDestroy() {
    // Non è necessario pulire gli effects in Angular Signals
  }
}
