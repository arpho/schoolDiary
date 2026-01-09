import { Component, OnInit, signal, ViewChild, ElementRef, input, inject, model, computed } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { Grids } from 'src/app/shared/models/grids';
import { Evaluation } from 'src/app/pages/evaluations/models/evaluation';
import { EvaluationService } from '../services/evaluation/evaluation.service';
import { EvaluateGridComponent } from 'src/app/pages/evaluations/components/evaluateGrid/evaluate-grid/evaluate-grid.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { ModalController } from '@ionic/angular';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { ClasseModel } from '../../classes/models/classModel';
import { ActivityDialogComponent } from 'src/app/pages/activities/components/activityDialog/activity-dialog/activity-dialog.component';
import { ClassiService } from '../../classes/services/classi.service';

/**
 * Pagina modale per la creazione, modifica e visualizzazione di una valutazione.
 * Gestisce l'intero ciclo di vita di una valutazione tramite un dialog.
 */
@Component({
  selector: 'app-evaluation-dialog',
  templateUrl: './evaluation-dialog.page.html',
  styleUrls: ['./evaluation-dialog.page.scss'],
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
export class EvaluationDialogPage implements OnInit {
  sortedActivities = computed(() =>
    [...this.activities()].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    })
  );
  classesList = signal<ClasseModel[]>([]);
  async openActivityDialog() {
    const user = await this.$users.getLoggedUser()
    let classi: ClasseModel[] = [];
    if (user?.classes) {
      const classKeys = user.classesKey;
      const classPromises = classKeys.map(classKey => this.classiService.fetchClasseOnCache(classKey));
      const classResults = await Promise.all(classPromises);
      classi = classResults.filter((classe): classe is ClasseModel => classe !== undefined);
    }
    console.log("openActivityDialog");
    console.log("classi", classi)
    console.log("evaluationSignal", this.evaluationSignal());
    const activity = signal<ActivityModel>(new ActivityModel({
      teacherKey: user?.key,
      classKey: this.classKey, date: new Date().toISOString()
    }));
    console.log("new activity", activity())
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
      console.log("local activity", activity());
      console.log("dismissed activity", result.data);
      this.activitiesService.addActivity(activity()).then((res: any) => {
        console.log("activity added", res);
        this.evaluationform.patchValue({
          activityKey: res.key
        })
      }).catch((error: any) => {
        console.error("Error adding activity", error);
      });
    }
  }

  close() {
    this.modalCtrl.dismiss();
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

        // Get values from route parameters
        console.log("studentKey from route params", this.studentKey);
        console.log("classKey from route params", this.classKey);

        evaluation.studentKey = evaluation.studentKey || this.studentKey;
        evaluation.classKey = evaluation.classKey || this.classKey;
        if (this.grid()) {
          evaluation.grid = this.grid()!;
          evaluation.gridsKey = this.grid()!.key;
          if (this.evaluateGridComponent) {
            evaluation.grid.indicatori = this.evaluateGridComponent.grid().indicatori;
          }
        }

        console.log("evaluation", evaluation);
        console.log("evaluation serialzed", evaluation.serialize());

        if (this.evaluationKey) {
          await this.evaluationService.updateEvaluation(evaluation);
        } else {
          await this.evaluationService.addEvaluation(evaluation);
        }

        console.log('Saving evaluation:', evaluationData);
        this.toaster.presentToast({
          message: 'Valutazione salvata con successo',
          duration: 3000,
          position: 'bottom'
        });
        this.modalCtrl.dismiss();
      } catch (error) {
        console.error('Error saving evaluation:', error);
        this.toaster.presentToast({
          message: 'Errore nel salvataggio della valutazione',
          duration: 3000,
          position: 'bottom'
        });
      }
    }
  }
  printEvaluation() {
    console.log("printEvaluation");
  }
  @ViewChild('evaluateGrid') evaluateGrid!: ElementRef;
  @ViewChild(EvaluateGridComponent) evaluateGridComponent!: EvaluateGridComponent;
  evaluation = input<Evaluation>(new Evaluation());
  evaluationSignal = signal<Evaluation>(new Evaluation());
  activities = signal<ActivityModel[]>([]);
  evaluationform: FormGroup = new FormGroup({
    description: new FormControl(''),
    note: new FormControl(''),
    data: new FormControl(new Date().toISOString()),
    grid: new FormControl(''),
    activityKey: new FormControl(''),
    classKey: new FormControl(''),
    studentKey: new FormControl('')
  });
  title = signal('');
  valutazione: Evaluation | null = null;
  classKey: string = '';
  studentKey: string = '';
  activityKey: string = '';
  grid = model<Grids>(new Grids());
  evaluationKey: string | null = null;
  griglie = signal<Grids[]>([]);
  modalCtrl = inject(ModalController);

  constructor(
    private route: ActivatedRoute,
    private toaster: ToasterService,
    private activitiesService: ActivitiesService,
    private fb: FormBuilder,
    private $users: UsersService,
    private gridsService: GridsService,
    private evaluationService: EvaluationService,
    private classiService: ClassiService,

  ) {
    console.log("EvaluationDialogPage constructor");
    const modalCtrl = inject(ModalController);
  }

  async ngOnInit() {
    const paramClassKey = this.route.snapshot.paramMap.get('classKey');
    console.log("paramClassKey", paramClassKey);
    // Initialize form controls with URL parameters
    this.classKey = this.route.snapshot.queryParams['classKey'] || this.route.snapshot.paramMap.get('classKey') || '';
    this.studentKey = this.route.snapshot.queryParams['studentKey'] || '';
    this.evaluationKey = this.evaluationSignal().key || this.route.snapshot.queryParams['evaluationKey'] || '';
    console.log("classKey", this.classKey);
    console.log("studentKey", this.studentKey);
    console.log("evaluationKey", this.evaluationKey);
    const user = await this.$users.getLoggedUser();

    this.evaluationSignal.set(new Evaluation(this.evaluation))
    if (user) {
      console.log(" teacherKey*", user.key)
      this.activitiesService.getActivities4teacherOnRealtime(user.key, (activities: ActivityModel[]) => {
        console.log("activities*", activities);
        this.activities.set(activities);
      },
        [new QueryCondition('classKey', '==', this.classKey)]);
    }
    console.log("init evaluation-dialog");
    console.log("evaluation", this.evaluationSignal())
    this.evaluationform = new FormGroup({
      description: new FormControl(''),
      note: new FormControl(''),
      data: new FormControl(new Date().toISOString()),
      grid: new FormControl(''),
      activityKey: new FormControl(''),
      classKey: new FormControl(this.classKey),
      studentKey: new FormControl(this.studentKey)
    });
    if (this.evaluationSignal().key) {
      this.evaluationKey = this.evaluationSignal().key;
      this.title.set("rivedi valutazione");
      this.classKey = this.evaluationSignal().classKey;
      this.studentKey = this.evaluationSignal().studentKey;
      this.activityKey = this.evaluationSignal().activityKey;
      this.evaluationform.patchValue({
        description: this.evaluationSignal().description,
        note: this.evaluationSignal().note,
        data: this.evaluationSignal().data,
        classKey: this.evaluationSignal().classKey,
        studentKey: this.evaluationSignal().studentKey
      });
      this.grid.set(this.evaluationSignal().grid);
    } else {
      this.title.set("Nuova valutazione");


    }
    this.evaluationform.controls['activityKey'].valueChanges.subscribe((activityKey: string | null) => {
      if (activityKey) {
        const activity = this.activities().find((a: ActivityModel) => a.key === activityKey);
        console.log("Selected   activity", activityKey);
        if (activity) {

          this.evaluationform.patchValue({
            title: activity.title,
            activityKey: activityKey,
          });
        }
      }
    });

    this.gridsService.getGridsOnRealtime((grids: Grids[]) => {
      this.griglie.set(grids);
    });

    if (this.evaluationKey) {
      this.title.set("rivedi valutazione");
      this.evaluationService.fetchEvaluation(this.evaluationKey).then((evaluation: Evaluation) => {
        this.valutazione = evaluation;
        this.evaluationform.patchValue({
          description: evaluation.description,
          note: evaluation.note,
          data: evaluation.data,
          grid: evaluation.grid.key,
          classeKey: evaluation.classKey,
          studentKey: evaluation.studentKey
        });
      });
    } else {
      this.title.set("Nuova valutazione");
    }


  }

}
