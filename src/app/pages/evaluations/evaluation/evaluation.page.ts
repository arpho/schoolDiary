import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { IonButtons } from '@ionic/angular/standalone';
import { IonContent } from '@ionic/angular/standalone';
import { IonHeader } from '@ionic/angular/standalone';
import { IonTitle } from '@ionic/angular/standalone';
import { IonToolbar } from '@ionic/angular/standalone';
import { IonItem } from '@ionic/angular/standalone';
import { IonLabel } from '@ionic/angular/standalone';
import { IonInput } from '@ionic/angular/standalone';
import { IonSelect } from '@ionic/angular/standalone';
import { IonSelectOption } from '@ionic/angular/standalone';
import { IonDatetime } from '@ionic/angular/standalone';
import { IonButton } from '@ionic/angular/standalone';
import { IonList } from '@ionic/angular/standalone';
import { IonTextarea } from '@ionic/angular/standalone';
import { IonIcon } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
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
import { EvaluateGridComponent } from '../components/evaluateGrid/evaluate-grid/evaluate-grid.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { ActivitiesService } from '../../activities/services/activities.service';
import { ActivityModel } from '../../activities/models/activityModel';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { ClasseModel } from '../../classes/models/classModel';
import { ClassiService } from '../../classes/services/classi.service';
import { ActivityDialogComponent } from '../../activities/components/activityDialog/activity-dialog/activity-dialog.component';

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
  ]
})
export class EvaluationPage implements OnInit {
  activities = signal<ActivityModel[]>([]);
  evaluationForm!: FormGroup;
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
  ) { }

  async ngOnInit() {
    // Initialize form controls with URL parameters
    this.classKey = this.route.snapshot.queryParams['classKey'] || '';
    this.studentKey = this.route.snapshot.queryParams['studentKey'] || '';
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

    this.evaluationForm = this.fb.group({
      description: [''],
      note: [''],
      data: [new Date().toISOString()],
      grid: [''],
      activityKey: [''],
      classKey: [this.classKey],
      studentKey: [this.studentKey]
    });

    this.gridsService.getGridsOnRealtime((grids: Grids[]) => {
      this.griglie.set(grids);
    });

    if (this.classKey) {
      this.title.set("Nuova valutazione");
    }
  }

  async saveEvaluation() {
    if (this.evaluationForm.valid) {
      const evaluationData = this.evaluationForm.value;
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
      this.evaluationForm.patchValue({
        activityKey: result.data.key
      });
    }
  }

  goBack() {
    this.router.navigate(['/evaluations-list']);
  }
}
