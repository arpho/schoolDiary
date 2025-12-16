import { Component, effect, inject, input, OnDestroy, signal, WritableSignal } from '@angular/core';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { UnsubscribeService } from 'src/app/shared/services/unsubscribe.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-activities4class-bis',
  templateUrl: './list-activities4class.component.html',
  styleUrls: ['./list-activities4class.component.scss'],
  standalone: true
})
export class ListActivities4classComponent implements OnDestroy {
  classkey = input.required<string>();
  activitieslist: WritableSignal<ActivityModel[]> = signal<ActivityModel[]>([]);
  private activitiesSubscription: Subscription | null = null;
  
  private readonly $activities = inject(ActivitiesService);
  private readonly $unsubscribe = inject(UnsubscribeService);

  constructor() {
    // Effetto che reagisce ai cambiamenti di classkey
    effect(() => {
      const currentClasskey = this.classkey();
      console.log('classkey changed:', currentClasskey);
      
      // Annulla la sottoscrizione precedente se esiste
  

      if (currentClasskey) {
        const queries: QueryCondition[] = [
          new QueryCondition('classkey', '==', currentClasskey)
        ];
        
        this.activitiesSubscription.add(  this.$activities.fetchActivitiesOnRealTime(
          (activities: ActivityModel[]) => {
            console.log(`Activities for ${currentClasskey}:`, activities);
            this.activitieslist.set(activities);
          }, 
          queries
        ));
        
        this.$unsubscribe.add(this.activitiesSubscription);
      } else {
        this.activitieslist.set([]);
      }
    });
  }

  ngOnDestroy(): void {
    // Pulizia esplicita per sicurezza
    if (this.activitiesSubscription) {
      this.$unsubscribe.clear()
    }
  }
}
