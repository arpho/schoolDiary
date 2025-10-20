import { Component, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
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
  IonFab,
  IonFabButton, 
  IonIcon,
  IonBackButton,
  IonNote,
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
    IonFabButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonButton,
    IonList,
    IonTextarea,
    IonIcon,
    IonBackButton,
    IonNote,
    IonFab,
    EvaluateGridComponent,
    ActivityDialogComponent
  ]
})
export class EvaluationPage implements OnInit {
  evaluationParam = input<Evaluation>(new Evaluation());
  teacherKey = signal<string>("");
  evaluationKey = signal<string>("");
isModal = input<boolean>(false);
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
    console.log("EvaluationPage constructor *");
    this.initializeForm();
    effect(() => {
      const teacherKey = this.teacherKey();
      console.log("effect   in constructor teacherKey* ", teacherKey);
      console.log("classkey*", this.classKey);
      this.loadActivitiesForClass(this.classKey, teacherKey);
    });
    addIcons({
      filter
    });


    // 2. Effect - Reagisce ai cambiamenti dell'input parameter
effect(() => {
  const evaluationData = this.evaluationParam();
  const isModal = this.isModal();
  if (evaluationData) {
    console.log("evaluationData*", evaluationData);
    console.log(" è modal*", isModal);
    this.evaluationKey.set(evaluationData.key);
    this.grid.set(evaluationData.grid);
      // Aggiorna il form con i dati della valutazione
    this.classKey = evaluationData.classKey;
    this.teacherKey.set(evaluationData.teacherKey);
    this.loadActivitiesForClass(this.classKey, this.teacherKey());
    this.evaluationform.patchValue({
      description: evaluationData.description,
      note: evaluationData.note,
      data: evaluationData.data,
      grid: evaluationData.gridsKey,
      activityKey: evaluationData.activityKey,
      classKey: evaluationData.classKey,
      studentKey: evaluationData.studentKey
      // ... altri campi
    });
    
    // Imposta il titolo corretto
    if (evaluationData.key) {
      this.title.set("Modifica valutazione");
    }
  }
});
  }
  loadActivitiesForClass(classKey: string, teacherKey: string) {
    console.log("loadActivitiesForClass*", classKey);
    console.log("teacherKey*", teacherKey);
    this.activitiesService.getActivities4teacherOnRealtime(
      teacherKey,
      (activities: ActivityModel[]) => {
        console.log("activities", activities);
        this.activities.set(activities);
      },
      [new QueryCondition('classKey', '==', classKey)]
    );
  }

  openFilterPopup() {
    console.log("openFilterPopup");
  }

  activities = signal<ActivityModel[]>([]);
  // Aggiungo un segnale per tenere traccia della validità della griglia
  isGridValid = signal<boolean>(false);
  
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

  // Validatore personalizzato per la griglia
  private gridValidator() {
    return (control: any) => {
      if (!(control instanceof FormGroup)) return null;
      
      const gridControl = control.get('grid');
      if (gridControl?.value && !this.isGridValid()) {
        return { gridInvalid: true };
      }
      return null;
    };
  }

  // Gestisce i cambiamenti di validità della griglia
  onGridValidityChange(isValid: boolean) {
    this.isGridValid.set(isValid);
    // Forza il ricalcolo della validità del form
    this.evaluationform.updateValueAndValidity();
  }

  title = signal('');
  
  classKey: string = '';
  studentKey: string = '';
  activityKey: string = '';
  grid = signal<Grids>(new Grids());
  griglie = signal<Grids[]>([]);
  classesList = signal<ClasseModel[]>([]);

  async ngOnInit() {
    // Initialize form controls with URL parameters first
    const routeParams = this.route.snapshot.params;
    this.classKey = routeParams['classKey'] || this.route.snapshot.paramMap.get('classKey') || '';
    this.studentKey = routeParams['studentKey'] || '';
    const paramClassKey = this.route.snapshot.paramMap.get('classKey');
    console.log("paramClassKey*", paramClassKey);
    console.log("classKey*", this.classKey);
    console.log("studentKey*", this.studentKey);
//    this.loadActivitiesForClass(this.classKey, this.teacherKey());
    const user = await this.$users.getLoggedUser();

    if (user) {
      // we suppose that only a teacher can 
      this.teacherKey.set(user.key);
      this.activitiesService.getActivities4teacherOnRealtime(
        user.key,
        (activities: ActivityModel[]) => {
          console.log("user*", user)
          console.log("activities*", activities);
          this.activities.set(activities);
        },
        [new QueryCondition('classKey', '==', this.classKey)]
      );
    }

    // Initialize form with default values first
    this.evaluationform = this.fb.group({
      description: [''],
      note: [''],
      data: [new Date().toISOString()],
      grid: [''],
      activityKey: [''],
      classKey: [this.classKey],
      studentKey: [this.studentKey]
    });

    if (this.evaluationform) {
      this.evaluationform.controls['grid'].valueChanges.subscribe((gridKey: string | null) => {
        if (gridKey) {
          const grid = this.griglie().find((grid) => grid.key === gridKey);
          if (grid) {
            this.grid.set(grid);
          }
        }
      });

      this.evaluationform.controls['activityKey'].valueChanges.subscribe((activityKey: string | null) => {
        if (activityKey) {
          const activity = this.activities().find((a: ActivityModel) => a.key === activityKey);
          console.log("Selected activity", activityKey);
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

    // Set title based on whether we have URL parameters
    if (this.classKey) {
      this.title.set("Nuova valutazione");
    }

    const evaluationData = this.evaluationParam();
    if (evaluationData) {
      // Update form with evaluation data
      this.evaluationform.patchValue({
        description: evaluationData.description,
        note: evaluationData.note,
        data: evaluationData.data ? new Date(evaluationData.data).toISOString() : new Date().toISOString(),
        grid: evaluationData.gridsKey,
        activityKey: evaluationData.activityKey,
        classKey: evaluationData.classKey,
        studentKey: evaluationData.studentKey
      });

      // Set title based on whether we're editing an existing evaluation
      if (evaluationData.key) {
        this.title.set("Modifica valutazione");
      }
    }
  }

  async saveEvaluation() {
    if (this.evaluationform.valid) {
      const evaluationData = this.evaluationform.value;
      try {
        const currentEvaluation = this.evaluationParam();
        const newEvaluation = currentEvaluation ? new Evaluation(currentEvaluation) : new Evaluation(evaluationData);

        // Update with form data
        newEvaluation.description = evaluationData.description;
        newEvaluation.note = evaluationData.note;
        newEvaluation.data = evaluationData.data;
        newEvaluation.activityKey = evaluationData.activityKey;
        newEvaluation.gridsKey = evaluationData.grid;

        const loggedUser = await this.$users.getLoggedUser();
        if (loggedUser) {
          newEvaluation.teacherKey = loggedUser.key;
        }

        newEvaluation.studentKey = evaluationData.studentKey || this.studentKey;
        newEvaluation.classKey = evaluationData.classKey || this.classKey;

        if (this.grid()) {
          newEvaluation.grid = this.grid();
        }
if (this.evaluationKey()) {
  console.log("edited evaluation");
          newEvaluation.key = this.evaluationKey();
         
          await this.evaluationService.editEvaluation(newEvaluation);
        } else {
          console.log("new evaluation");
          await this.evaluationService.addEvaluation(newEvaluation);
        }

        this.toaster.showToast({
          message: 'Valutazione salvata con successo',
          duration: 3000,
          position: 'bottom'
        });
        if (this.isModal()) {
          console.log("dismiss");
          this.modalCtrl.dismiss();
        } else {
          console.log("navigate");
          this.router.navigate(['/evaluations-list']);
        }
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
      const newActivity = await this.activitiesService.addActivity(activity());
      this.evaluationform.patchValue({
        activityKey: newActivity.key
      });
      this.evaluationform.updateValueAndValidity();
    }
  }

  goBack() {
    this.router.navigate(['/evaluations-list']);
  }
}
