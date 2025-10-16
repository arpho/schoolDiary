import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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

    const evaluationKey = this.route.snapshot.paramMap.get('evaluationKey');
    console.log(evaluationKey);
    if(evaluationKey){
    const evaluation = await this.$evaluation.getEvaluation(evaluationKey);
    this.evaluation.set(evaluation);
    console.log("editing ", evaluation)
    this.initializeForm(evaluation);
    this.grid.set(evaluation.grid);
    }
    


}

private initializeForm(evaluation: Evaluation) {
  console.log("initializeForm", evaluation);
  this.evaluationform = this.fb.group({
    description: [evaluation.description],
    note: [evaluation.note],
    data: [evaluation.data],
    grid: [evaluation.grid],
    activityKey: [evaluation.activityKey],
    classKey: [evaluation.classKey],
    studentKey: [evaluation.studentKey]
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

    onGridValidityChange(isValid: boolean) {
      this.isGridValid.set(isValid);
      // Forza il ricalcolo della validità del form
      this.evaluationform.updateValueAndValidity();
    }

}
