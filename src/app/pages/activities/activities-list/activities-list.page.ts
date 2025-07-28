import { Component, OnInit, signal, inject, effect } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonList, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonFab, IonFabButton, IonFabList, IonBackButton, IonCardSubtitle, IonButton, AlertInput } from '@ionic/angular/standalone';
import { ActivityModel } from '../models/activityModel';
import { UsersService } from '../../../shared/services/users.service';
import { UserModel } from '../../../shared/models/userModel';
import { ActivitiesService } from '../services/activities.service';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ModalController } from '@ionic/angular';
import { ActivityDialogComponent } from '../components/activityDialog/activity-dialog/activity-dialog.component';


@Component({
  selector: 'app-activities-list',
  templateUrl: './activities-list.page.html',
  styleUrls: ['./activities-list.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonList,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonFab,
    IonFabButton,
    IonFabList,
    IonBackButton,
    IonCardSubtitle,
    IonButton
]
})
export class ActivitiesListPage implements OnInit {

  activity = signal<ActivityModel >(new ActivityModel({
    title: '',
    description: '',
    classKey: '',
    date: new Date().toISOString(),
    teacherKey: ''
  }));
  private usersService = inject(UsersService);
  private activitiesService = inject(ActivitiesService);
  private classiService = inject(ClassiService);
  private classesList = signal<ClasseModel[]>([]);
  private modalController = inject(ModalController);
  

  constructor() { 

    effect(() => {
      const user = this.loggedUser();
      if (user?.classes) {
        const classKeys = user.classesKey as string[];
        const classi = classKeys.map(classKey => this.classiService.fetchClasseOnCache(classKey))
          .filter((classe): classe is ClasseModel => classe !== undefined);
        this.classesList.set(classi);    
      }
    });
  }
  async newActivity() {
    const user =await  this.usersService.getLoggedUser();
  console.log("user", user);
    const activity = signal<ActivityModel>(new ActivityModel({
      title: '',
      description: '',
      classKey: '',
      date: new Date().toISOString(),
      teacherKey: user?.key || '' 
    }).setTeacherKey(user?.key || ''));
    const modal = await this.modalController.create({
      component: ActivityDialogComponent,
      componentProps: {
        listaClassi: this.classesList(),
        activity: activity
      }
    });
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result.data) {
      console.log("local activity", activity());
console.log("dismissed activity", result.data);
this.activitiesService.addActivity(activity());
    }
  }

  activitiesList = signal<ActivityModel[]>([]);
  loggedUser = signal<UserModel | null>(null);
  
  seeClass(classKey: string): string {
    const classe = this.classesList().find(classe => classe.key === classKey);
    return `${classe?.classe} ${classe?.year}`;
  }



  ngOnInit() {
    this.usersService.getLoggedUser().then((user: UserModel | null) => {
      this.loggedUser.set(user);
      if (user?.classes) {
        // Get activities for all classes the user is in
        const classKeys = user.classesKey as string[];
        if (Array.isArray(classKeys)) {
          classKeys.forEach(classKey => {
            this.activitiesService.getActivitiesOnRealtime(
              '', // teachersKey - leave empty since we want all teachers
              classKey,
              (activities: ActivityModel[]) => {
                // Update the activities list
                this.activitiesList.set(activities);
              },
              [new QueryCondition('classKey', 'in', classKey)]
            );
          });
        }
      }
    });
  }

}
