import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { UnsubscribeService } from 'src/app/shared/services/unsubscribe.service';

@Component({
  selector: 'app-list-activities4class',
  templateUrl: './list-activities4class.component.html',
  styleUrls: ['./list-activities4class.component.scss'],
})
export class ListActivities4classComponent  implements OnInit {
classkey = input<string>("")
activitieslist = signal<ActivityModel[]>([]) 
$activities = inject(ActivitiesService)
$unsubscribe = inject(UnsubscribeService)
  constructor() {
    effect(()=>{
      console.log("classkey", this.classkey())
      const queries :QueryCondition[] = [new QueryCondition("classkey", "==", this.classkey())]
      this.$unsubscribe.add(this.$activities.fetchActivitiesOnRealTime((activities: ActivityModel[]) => {
        this.activitieslist.set(activities);
        console.log(`activities for ${this.classkey()}`, activities)
      }, queries))

    })
   }

  ngOnInit() {}

}
