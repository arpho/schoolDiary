import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';
import { Evaluation } from '../../models/evaluation';
import { ActivatedRoute } from '@angular/router';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { QueryFieldFilterConstraint } from 'firebase/firestore';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { filter, save } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButton,
  IonList,
  IonTextarea,
  IonFab,
  IonFabButton, 
  IonIcon,
  IonBackButton,
  IonNote,
  ModalController
} from '@ionic/angular/standalone';
import { User } from 'firebase/auth';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { Grids } from 'src/app/shared/models/grids';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { EvaluateGridComponent } from '../evaluateGrid/evaluate-grid/evaluate-grid.component';
@Component({
  selector: 'app-evaluation4pages',
  templateUrl: './evaluation4pages.component.html',
  styleUrls: ['./evaluation4pages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [

    FormsModule,
    ReactiveFormsModule,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonButton,
    IonList,
    IonTextarea,
    IonFab,
    IonFabButton, 
    IonIcon,
    IonBackButton,
    IonNote,
    EvaluateGridComponent
  ]
})
export class Evaluation4pagesComponent  implements OnInit {
  studentKey = signal<string>("");
  classKey = signal<string>("");
  teacherKey = signal<string>("");
  activities = signal<ActivityModel[]>([]);
  title = signal('');
    grid = signal<Grids>(new Grids());
    griglie = signal<Grids[]>([]);
  student = signal<UserModel>(new UserModel());
  isGridValid = signal<boolean>(false);
  $users = inject(UsersService);
    // Inizializzo il form nel costruttore invece che nella dichiarazione
    evaluationform!: FormGroup;
    // Inizializza il form
    private initializeForm() {
      this.evaluationform = this.fb.group({
        description: [''],
        note: [''],
        data: [new Date().toISOString()],
        grid: [''],
        activityKey: [''],
        classKey: [this.classKey],
        studentKey: [this.studentKey]
      }, { validators: [this.gridValidator()] });
    }
  constructor(private route: ActivatedRoute,
    private fb: FormBuilder,
    private $activites: ActivitiesService,
    private gridsService: GridsService
  ) { 
    addIcons({
      save,
    });
    this.initializeForm();
    this.gridsService.getGridsOnRealtime((grids: Grids[]) => {
      console.log("grids", grids);
      this.griglie.set(grids);
    });
  }

  async ngOnInit() {
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
