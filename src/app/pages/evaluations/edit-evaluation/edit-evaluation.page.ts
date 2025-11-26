import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Evaluation } from '../models/evaluation';
import { EvaluationService } from '../services/evaluation/evaluation.service';
import { EvaluateGridComponent } from '../components/evaluateGrid/evaluate-grid/evaluate-grid.component';
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
import { Grids } from 'src/app/shared/models/grids';
import { UserModel } from 'src/app/shared/models/userModel';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { ActivityModel } from '../../activities/models/activityModel';
import { ActivitiesService } from '../../activities/services/activities.service';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { ActivityDialogComponent } from '../../activities/components/activityDialog/activity-dialog/activity-dialog.component';
import { ClasseModel } from '../../classes/models/classModel';
import { ClassiService } from '../../classes/services/classi.service';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-edit-evaluation',
  templateUrl: './edit-evaluation.page.html',
  styleUrls: ['./edit-evaluation.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class EditEvaluationPage implements OnInit {
  $classes = inject(ClassiService);
  modalCtrl = inject(ModalController);
  async openActivityDialog() {
    const teacher = await this.$users.fetchUserOnCache(this.teacherKey());
    console.log("teacher", teacher);
    let classi: ClasseModel[] = [];
    if (teacher?.classes) {
      const classKeys = teacher.classesKey;
      const classPromises = classKeys.map(classKey => this.$classes.fetchClasseOnCache(classKey));
      const classResults = await Promise.all(classPromises);
      classi = classResults.filter((classe): classe is ClasseModel => classe !== undefined);
    }

    const activity = signal<ActivityModel>(new ActivityModel({
      teacherKey: teacher?.key,
      classKey: this.classKey,
      date: new Date().toISOString()
    }));
    const classi4Teacher = await Promise.all(teacher?.classesKey.map(classKey => this.$classes.fetchClasseOnCache(classKey)) || [])
    console.log("classi4Teacher", classi4Teacher);

    const modal = await this.modalCtrl.create({
      component: ActivityDialogComponent,
      componentProps: {
        listaClassi: classi4Teacher,
        activity: activity,
        selectedClass: this.classKey()
      }
    });
    await modal.present();

    const result = await modal.onDidDismiss();
    if (result.data) {
      const newActivity = await this.$activites.addActivity(activity());

      this.evaluationform.patchValue({
        activityKey: newActivity.key
      });
      this.evaluationform.updateValueAndValidity();
    }
  }
  updateEvaluation() {
    const evaluation = this.evaluation();
    if (evaluation) {
      console.log("evaluation before ", evaluation);
      console.log("evaluationform", this.evaluationform.value);
      evaluation.build(this.evaluationform.value);
      console.log("evaluation after ", evaluation);
      evaluation.grid = this.grid();
      console.log("evaluation grid ", evaluation.grid);
      try {
        this.$evaluations.updateEvaluation(evaluation);
        this.router.navigate(['/pdf-evaluation', evaluation.key]);
        this.$toaster.presentToast({
          message: 'Valutazione aggiornata con successo',
          position: 'top'
        });
      }
      catch (error) {
        console.log("Error updating evaluation:", error);
      }
    }


  }

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
  private $activites = inject(ActivitiesService);
  private $grids = inject(GridsService);
  $evaluations = inject(EvaluationService);
  private $toaster = inject(ToasterService);
  route = inject(ActivatedRoute);
  evaluation = signal<Evaluation | null>(null);
  $evaluation = inject(EvaluationService);

  // Form group declaration
  evaluationform: FormGroup;

  constructor(private fb: FormBuilder,
    private router: Router) {
    console.log("EditEvaluationPage constructor chiamato");
    addIcons({
      'save': 'save-outline',
      'pdf': 'pdf-outline'
    });
    // Initialize form in constructor
    this.evaluationform = this.fb.group({
      description: [''],
      note: [''],
      data: [new Date()],
      gridKey: [null],
      activityKey: [''],
      classKey: [''],
      studentKey: ['']
    }, { validators: [this.gridValidator()] });
  }

  async ngOnInit() {
    console.log('ngOnInit - Inizio');
    const evaluationKey = this.route.snapshot.paramMap.get('evaluationKey');
    console.log('Evaluation key:', evaluationKey);

    if (evaluationKey) {
      try {
        console.log('Caricamento valutazione...');
        const evaluation = await this.$evaluation.fetchEvaluation(evaluationKey);
        console.log('Evaluation loaded:', JSON.parse(JSON.stringify(evaluation)));
        this.evaluation.set(evaluation);

        if (!evaluation) {
          throw new Error('Valutazione non trovata');
        }

        // Imposta i segnali prima di inizializzare il form
        this.evaluation.set(evaluation);
        this.classKey.set(evaluation.classKey || '');
        this.teacherKey.set(evaluation.teacherKey || '');
        this.studentKey.set(evaluation.studentKey || '');
        this.grid.set(evaluation.grid || new Grids());

        console.log('Segnali impostati:', {
          classKey: this.classKey(),
          teacherKey: this.teacherKey(),
          studentKey: this.studentKey(),
          grid: this.grid()
        });

        // Carica le griglie
        this.$grids.getGridsOnRealtime((griglie: Grids[]) => {
          console.log('Griglie caricate:', griglie);
          this.griglie.set(griglie);
        });

        // Carica le attività per l'insegnante e la classe
        this.$activites.getActivities4teacherOnRealtime(
          evaluation.teacherKey,
          (activities: ActivityModel[]) => {
            console.log('Activities loaded:', activities);
            this.activities.set(activities);
            // Inizializza il form solo dopo aver caricato tutto
            this.initializeForm(evaluation);
          },
          [new QueryCondition('classKey', '==', evaluation.classKey)]
        );
      } catch (error) {
        console.error('Error loading evaluation:', error);
        this.$toaster.presentToast({
          message: 'Errore nel caricamento della valutazione',
          position: 'top'
        });
      }
    }



  }



  private initializeForm(evaluation: Evaluation) {
    console.log('initializeForm - Inizio', {
      evaluation: JSON.parse(JSON.stringify(evaluation)),
      hasGrid: !!evaluation?.grid,
      hasActivities: this.activities().length > 0
    });

    // Gestisci la data in base al tipo
    let evaluationDate: Date = new Date();
    const data = evaluation?.data;

    if (!data) {
      evaluationDate = new Date();
    } else if (typeof data === 'string') {
      evaluationDate = new Date(data);
    } else if (Object.prototype.toString.call(data) === '[object Date]') {
      evaluationDate = data as Date;
    } else if (data && typeof (data as any).toDate === 'function') {
      evaluationDate = (data as any).toDate();
    }

    console.log('Data elaborata:', evaluationDate);

    try {
      const formValues = {
        description: evaluation?.description || '',
        note: evaluation?.note || '',
        data: evaluationDate,
        gridKey: evaluation?.grid?.key || null,
        activityKey: evaluation?.activityKey || '',
        classKey: evaluation?.classKey || '',
        studentKey: evaluation?.studentKey || ''
      };

      console.log('Valori del form da inizializzare:', formValues);
      console.log('Griglia corrente:', evaluation?.grid);
      this.grid.set(evaluation?.grid);
      console.log('gridKey impostato a:', formValues.gridKey);

      console.log('Valori del form da inizializzare:', formValues);

      // Update the form with the new values
      this.evaluationform.patchValue(formValues);
      this.evaluationform.setValidators([this.gridValidator()]);
      this.evaluationform.updateValueAndValidity();

      console.log('Form aggiornato con valori:', {
        formValue: this.evaluationform.value,
        formStatus: this.evaluationform.status,
        formErrors: this.evaluationform.errors
      });
    } catch (error) {
      console.error('Errore durante l\'inizializzazione del form:', error);
      throw error;
    }
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

  onGridValidityChange(isValid: boolean) {
    this.isGridValid.set(isValid);
    // Forza il ricalcolo della validità del form
    this.evaluationform.updateValueAndValidity();
  }

  // Aggiungi questo metodo per ottenere la griglia selezionata
  getSelectedGrid() {
    if (this.grid()) { return this.grid() }
    else {
      const gridKey = this.evaluationform.get('gridKey')?.value;
      if (!gridKey) return null;
      return this.griglie().find(g => g.key === gridKey) || null;
    }
  }
}
