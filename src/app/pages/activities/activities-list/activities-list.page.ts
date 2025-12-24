import { Component, OnInit, signal, inject, effect, OnDestroy } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonList, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonFab, IonFabButton, IonFabList, IonBackButton, IonButtons, IonCardSubtitle, IonButton, AlertInput, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { ActivityModel } from '../models/activityModel';
import { UsersService } from '../../../shared/services/users.service';
import { UserModel } from '../../../shared/models/userModel';
import { ActivitiesService } from '../services/activities.service';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ModalController } from '@ionic/angular';
import { ActivityDialogComponent } from '../components/activityDialog/activity-dialog/activity-dialog.component';
import { DatePipe } from '@angular/common';
import { user } from '@angular/fire/auth';


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
    IonButtons,
    IonCardSubtitle,
    IonButton,
    DatePipe,
    IonSelect,
    IonSelectOption
  ]
})
export class ActivitiesListPage implements OnInit, OnDestroy {

  activity = signal<ActivityModel>(new ActivityModel({
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
  selectedClassKey = signal<string>('all');
  private activitiesSubscription?: () => void;


  constructor() {

    effect(async () => {
      const user = this.loggedUser();
      if (user?.classes) {
        const classKeys = user.classesKey as string[];
        const classPromises = classKeys.map((classKey) => this.classiService.fetchClasseOnCache(classKey));
        const classResults = await Promise.all(classPromises);
        const classi = classResults.filter((classe): classe is ClasseModel => classe !== undefined);
        this.classesList.set(classi);
      }
    });
  }
  async newActivity() {
    const user = await this.usersService.getLoggedUser();
    console.log("user", user);
    console.log("classi del docente ", user?.lastName, user?.firstName, this.classesList());
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



  async ngOnInit() {
    const user = await this.usersService.getLoggedUser();
    if (user) {
      this.loggedUser.set(user);
      this.loadActivities();
    }
  }

  loadActivities() {
    const user = this.loggedUser();
    if (!user) return;

    if (this.activitiesSubscription) {
      this.activitiesSubscription();
    }

    const classKey = this.selectedClassKey();
    let conditions: QueryCondition[] = [];
    if (classKey !== 'all') {
      conditions = [new QueryCondition('classKey', '==', classKey)];
    } else {
      conditions = [new QueryCondition('classKey', 'in', user.classesKey)];
    }

    this.activitiesSubscription = this.activitiesService.getActivities4teacherOnRealtime(
      user.key,
      (activities: ActivityModel[]) => {
        console.log("activities", activities);
        this.activitiesList.set(activities);
      },
      conditions
    );
  }

  onClassChange(event: any) {
    this.selectedClassKey.set(event.detail.value);
    this.loadActivities();
  }

  ngOnDestroy() {
    if (this.activitiesSubscription) {
      this.activitiesSubscription();
    }
  }

}
