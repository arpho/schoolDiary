import { Component, OnInit, signal, ViewChild, ElementRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl } from '@angular/forms';
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
import { Evaluation } from 'src/app/shared/models/evaluation';
import { EvaluationService } from '../services/evaluation/evaluation.service';
import { EvaluateGridComponent } from 'src/app/pages/evaluations/components/evaluateGrid/evaluate-grid/evaluate-grid.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { ModalController } from '@ionic/angular';

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
close() {
this.modalCtrl.dismiss();
}
printEvaluation() {
console.log("printEvaluation");
}
  @ViewChild('evaluateGrid') evaluateGrid!: ElementRef;
  @ViewChild(EvaluateGridComponent) evaluateGridComponent!: EvaluateGridComponent;
  evaluation = input<Evaluation>(new Evaluation());
  evaluationSignal = signal<Evaluation>(new Evaluation());
  evaluationForm!: FormGroup;
  title=signal('');
  valutazione: Evaluation | null = null;
  classKey: string = '';
  studentKey: string = '';
  grid = signal<Grids>(new Grids());
  evaluationKey: string | null = null;
  griglie = signal<Grids[]>([]);

  constructor(
    private route: ActivatedRoute,
    private toaster: ToasterService,
    private fb: FormBuilder,
    private $users: UsersService,
    private gridsService: GridsService,
    private evaluationService: EvaluationService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.evaluationSignal.set(new Evaluation(this.evaluation))
    console.log("init evaluation-dialog");
    console.log("evaluation",this.evaluationSignal())
    this.evaluationForm = new FormGroup({
      description: new FormControl(''),
      note: new FormControl(''),
      data: new FormControl(new Date().toISOString()),
      grid: new FormControl(''),
      classKey: new FormControl(this.classKey),
      studentKey: new FormControl(this.studentKey)
    });
    if(this.evaluationSignal().key){
      this.evaluationKey = this.evaluationSignal().key;
      this.title.set("rivedi valutazione");
      this.classKey = this.evaluationSignal().classKey;
      this.studentKey = this.evaluationSignal().studentKey;
      this.evaluationForm.patchValue({
        description: this.evaluationSignal().description,
        note: this.evaluationSignal().note,
        data: this.evaluationSignal().data,
        classKey: this.evaluationSignal().classKey,
        studentKey: this.evaluationSignal().studentKey
      });
      this.grid.set(this.evaluationSignal().grid);
    }else{
      this.title.set("Nuova valutazione *");

  
    }
    // Initialize form controls with URL parameters
    this.classKey = this.route.snapshot.queryParams['classKey'] || '';
    this.studentKey = this.route.snapshot.queryParams['studentKey'] || '';
    this.evaluationKey = this.evaluationSignal().key || this.route.snapshot.queryParams['evaluationKey'] || '';
    console.log("classKey", this.classKey);
    console.log("studentKey", this.studentKey);
    console.log("evaluationKey", this.evaluationKey);

  
    this.evaluationForm.controls['grid'].valueChanges.subscribe((gridKey: string | null) => {
      if (gridKey) {
        const grid = this.griglie().find((g: Grids) => g.key === gridKey);
        console.log("Selected grid", gridKey);
        if (grid) {
          this.grid.set(grid);
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
        this.evaluationForm.patchValue({
          description: evaluation.description,
          note: evaluation.note,
          data: evaluation.data,
          grid: evaluation.grid.key,
          classeKey: evaluation.classKey,
          studentKey: evaluation.studentKey
        });
      });
    } else {
      this.title.set("Nuova valutazione**");
    }


  }

  async saveEvaluation() {
    if (this.evaluationForm.valid) {
      const evaluationData = this.evaluationForm.value;
    try {
      const evaluation = new Evaluation(evaluationData);
      const loggedUser = await this.$users.getLoggedUser();
      if(loggedUser){
        evaluation.teacherKey = loggedUser.key;
      }

      // Get values from route parameters


      console.log("studentKey from route params", this.studentKey);
      console.log("classKey from route params", this.classKey);

      evaluation.studentKey = evaluation.studentKey || this.studentKey;
      evaluation.classKey = evaluation.classKey || this.classKey;
      if(this.grid()){
        evaluation.grid = this.grid()!;
        evaluation.gridsKey = this.grid()!.key;
      }

      console.log("evaluation",evaluation);
      console.log("evaluation serialzed",evaluation.serialize());
         
        if(this.evaluationKey){
          this.evaluationService.updateEvaluation(this.evaluationKey, evaluation);
        }else{
          this.evaluationService.addEvaluation(evaluation);
        } 
        console.log('Saving evaluation:', evaluationData);
        this.toaster.showToast({
          message: 'Valutazione salvata con successo',
          duration: 3000,
          position: 'bottom'
        }); 
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
}
