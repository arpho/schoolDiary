import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl
} from '@angular/forms';
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
  IonIcon,
  IonBackButton,
  ModalController
} from '@ionic/angular/standalone';
import { signal } from '@angular/core';
import { inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { Grids } from 'src/app/shared/models/grids';
import { Evaluation } from '../models/evaluation';
import { EvaluationService } from '../services/evaluation/evaluation.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { ActivitiesService } from '../../activities/services/activities.service';
import { ActivityModel } from '../../activities/models/activityModel';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { ClasseModel } from '../../classes/models/classModel';
import { ClassiService } from '../../classes/services/classi.service';
import { ActivityDialogComponent } from '../../activities/components/activityDialog/activity-dialog/activity-dialog.component';
import { EvaluateGridComponent } from '../components/evaluateGrid/evaluate-grid/evaluate-grid.component';
import { filter } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.page.html',
  styleUrls: ['./evaluation.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    EvaluateGridComponent,
    IonIcon,
    IonBackButton,
    
  ]
})
export class EvaluationPage implements OnInit {
openFilterPopup() {
console.log("openFilterPopup");
}
  activities = signal<ActivityModel[]>([]);
  evaluationform: FormGroup = new FormGroup({
    description: new FormControl(''),
    note: new FormControl(''),
    data: new FormControl(new Date().toISOString()),
    grid: new FormControl(''),
    activityKey: new FormControl(''),
    classKey: new FormControl(""),
    studentKey: new FormControl("")
  });
  title = signal('');
  classKey: string = '';
  studentKey: string = '';
  activityKey: string = '';
  grid = signal<Grids>(new Grids());
  griglie = signal<Grids[]>([]);
  classesList = signal<ClasseModel[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToasterService,
    private activitiesService: ActivitiesService,
    private fb: FormBuilder,
    private $users: UsersService,
    private gridsService: GridsService,
    private evaluationService: EvaluationService,
    private classiService: ClassiService,
    private modalCtrl: ModalController
  ) { 
    addIcons({
      filter
    });
  }

  async ngOnInit() {
    // Initialize form controls with URL parameters
    const routeParams = this.route.snapshot.params;
    this.classKey = routeParams['classKey'] || '';
    this.studentKey = routeParams['studentKey'] || '';

    console.log("classKey", this.classKey);
    console.log("studentKey", this.studentKey);
    const user = await this.$users.getLoggedUser();


    if (user) {
      this.activitiesService.getActivitiesOnRealtime(
        user.key,
        (activities: ActivityModel[]) => {
          this.activities.set(activities);
        },
        [new QueryCondition('classKey', '==', this.classKey)]
      );
    }

    this.evaluationform = this.fb.group({
      description: [''],
      note: [''],
      data: [new Date().toISOString()],
      grid: [''],
      activityKey: [''],
      classKey: [this.classKey],
      studentKey: [this.studentKey]
    });
   
    if(this.evaluationform)
      {
      this.evaluationform.controls['grid'].valueChanges.subscribe((gridKey: string | null) => {
        if (gridKey) {
          const grid = this.griglie().find((grid) => grid.key === gridKey);
          if (grid) {
            this.grid.set(grid);
          }
        }
      });
    /*     this.evaluationform.valueChanges.subscribe((value) => {
          console.log("value", value);
   
          if(value.grid){
            const grid = this.griglie().find((grid) => grid.key === value.grid);
            if( grid &&grid.key!=this.grid().key){
              this.grid.set(grid);
            }
          }
        }); */
        this.evaluationform.controls['activityKey'].valueChanges.subscribe((activityKey: string | null) => {
          if (activityKey) {
            const activity = this.activities().find((a: ActivityModel) => a.key === activityKey);
            console.log("Selected   activity", activityKey);
            if (activity) {
            this.evaluationform.patchValue({
              description: activity.title
            });
            }
          }
        });
      }

    this.gridsService.getGridsOnRealtime((grids: Grids[]) => {
      this.griglie.set(grids);
    });

    if (this.classKey) {
      this.title.set("Nuova valutazione");
    }
  }

  async saveEvaluation() {
    if (this.evaluationform.valid) {
      const evaluationData = this.evaluationform.value;
      try {
        const evaluation = new Evaluation(evaluationData);
        const loggedUser = await this.$users.getLoggedUser();
        if (loggedUser) {
          evaluation.teacherKey = loggedUser.key;
        }

        evaluation.studentKey = evaluation.studentKey || this.studentKey;
        evaluation.classKey = evaluation.classKey || this.classKey;
        if (this.grid()) {
          evaluation.grid = this.grid();
          evaluation.gridsKey = this.grid().key;
        }

        await this.evaluationService.addEvaluation(evaluation);
        
        this.toaster.showToast({
          message: 'Valutazione salvata con successo',
          duration: 3000,
          position: 'bottom'
        });
        this.router.navigate(['/evaluations-list']);
      } catch (error) {
        console.error('Error saving evaluation:', error);
        this.toaster.showToast({
          message: 'Errore nel salvataggio della valutazione',
          duration: 3000,
          position: 'bottom'
        });
      }
    }
  }

  async openActivityDialog() {
    const user = await this.$users.getLoggedUser();
    let classi: ClasseModel[] = [];
    if (user?.classes) {
      const classKeys = user.classesKey;
      classi = classKeys.map(classKey => this.classiService.fetchClasseOnCache(classKey))
        .filter((classe): classe is ClasseModel => classe !== undefined);
    }

    const activity = signal<ActivityModel>(new ActivityModel({
      teacherKey: user?.key,
      classKey: this.classKey,
      date: new Date().toISOString()
    }));

    const modal = await this.modalCtrl.create({
      component: ActivityDialogComponent,
      componentProps: {
        listaClassi: classi,
        activity: activity
      }
    });
    await modal.present();

    const result = await modal.onDidDismiss();
    if (result.data) {
      await this.activitiesService.addActivity(activity());
      this.evaluationform.patchValue({
        activityKey: result.data.key
      });
    }
  }

  goBack() {
    this.router.navigate(['/evaluations-list']);
  }
}
