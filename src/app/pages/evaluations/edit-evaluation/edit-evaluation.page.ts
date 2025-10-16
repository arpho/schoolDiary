import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
openActivityDialog() {
console.log("openActivityDialog");
}
updateEvaluation() {
console.log("updateEvaluation");
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
    // Inizializzo il form nel costruttore invece che nella dichiarazione
    evaluationform!: FormGroup;
      $evaluations = inject(EvaluationService);
   private $toaster = inject(ToasterService);


  route = inject(ActivatedRoute);
evaluation = signal<Evaluation | null>(null);
  $evaluation = inject(EvaluationService);
  constructor(
    private fb: FormBuilder,
  ) { 
    console.log("EditEvaluationPage constructor chiamato")
  }

  async ngOnInit() {
    console.log('ngOnInit - Inizio');
    const evaluationKey = this.route.snapshot.paramMap.get('evaluationKey');
    console.log('Evaluation key:', evaluationKey);
    
    if (evaluationKey) {
      try {
        console.log('Caricamento valutazione...');
        const evaluation = await this.$evaluation.getEvaluation(evaluationKey);
        console.log('Evaluation loaded:', JSON.parse(JSON.stringify(evaluation)));
        
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
      grid: evaluation?.grid || null,
      activityKey: evaluation?.activityKey || '',
      classKey: evaluation?.classKey || '',
      studentKey: evaluation?.studentKey || ''
    };
    
    console.log('Valori del form da inizializzare:', formValues);
    
    this.evaluationform = this.fb.group({
      description: [formValues.description],
      note: [formValues.note],
      data: [formValues.data],
      grid: [formValues.grid],
      activityKey: [formValues.activityKey],
      classKey: [formValues.classKey],
      studentKey: [formValues.studentKey]
    }, { validators: [this.gridValidator()] });
    
    console.log('Form inizializzato con valori:', {
      formValue: this.evaluationform.value,
      formStatus: this.evaluationform.status,
      formErrors: this.evaluationform.errors
    });
    
    // Forza l'aggiornamento della vista
    this.evaluationform.updateValueAndValidity();
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

}
