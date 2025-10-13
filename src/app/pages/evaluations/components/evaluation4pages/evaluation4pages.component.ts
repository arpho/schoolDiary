import { Component, OnInit, signal } from '@angular/core';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';
import { Evaluation } from '../../models/evaluation';
import { ActivatedRoute } from '@angular/router';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { QueryFieldFilterConstraint } from 'firebase/firestore';
import { QueryCondition } from 'src/app/shared/models/queryCondition';

@Component({
  selector: 'app-evaluation4pages',
  templateUrl: './evaluation4pages.component.html',
  styleUrls: ['./evaluation4pages.component.scss'],
})
export class Evaluation4pagesComponent  implements OnInit {
  studentKey = signal<string>("");
  classKey = signal<string>("");
  teacherKey = signal<string>("");
  activities = signal<ActivityModel[]>([]);

  constructor(private route: ActivatedRoute,
    private $activites: ActivitiesService
  ) { }

  ngOnInit() {
    const classKey = this.route.snapshot.paramMap.get('classKey');
      const studentKey = this.route.snapshot.paramMap.get('studentKey');
      const teacherKey = this.route.snapshot.paramMap.get('teacherKey');
      console.log(classKey, studentKey, teacherKey);
      this.classKey.set(classKey!);
      this.studentKey.set(studentKey!);
      this.teacherKey.set(teacherKey!);
      this.$activites.getActivities4teacherOnRealtime(teacherKey!, (activities: ActivityModel[]) => {
        console.log("activities", activities);
        this.activities.set(activities);
      },[new QueryCondition("classKey", "==", classKey!)]);
  }

}
