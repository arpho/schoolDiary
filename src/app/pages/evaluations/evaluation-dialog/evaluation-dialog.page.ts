import { Component, OnInit, inject, signal, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonDatetime, IonButton, IonList, IonTextarea } from '@ionic/angular/standalone';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { Grids } from 'src/app/shared/models/grids';
import { Evaluation } from 'src/app/shared/models/evaluation';
import { EvaluationService } from '../services/evaluation/evaluation.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { EvaluateGridComponent } from 'src/app/pages/evaluations/components/evaluateGrid/evaluate-grid/evaluate-grid.component';
import { UsersService } from 'src/app/shared/services/users.service';

@Component({
  selector: 'app-evaluation-dialog',
  templateUrl: './evaluation-dialog.page.html',
  styleUrls: ['./evaluation-dialog.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonBackButton,
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
    EvaluateGridComponent
  ]
})
export class EvaluationDialogPage implements OnInit {
  @ViewChild('evaluateGrid') evaluateGrid!: ElementRef;
  @ViewChild(EvaluateGridComponent) evaluateGridComponent!: EvaluateGridComponent;

  evaluationForm!: FormGroup;
  title: string = '';
  valutazione: Evaluation | null = null;
  classKey: string = '';
  studentKey: string = '';
  grid = signal<Grids | null>(null);
  evaluationKey: string | null = null;
  griglie = signal<Grids[]>([]);

  constructor(
    private route: ActivatedRoute,
    private toaster: ToasterService,
    private fb: FormBuilder,
    private $users: UsersService,
    private gridsService: GridsService,
    private evaluationService: EvaluationService  
  ) { }

  ngOnInit() {
    // Initialize form controls with URL parameters
    this.classKey = this.route.snapshot.queryParams['classKey'] || '';
    this.studentKey = this.route.snapshot.queryParams['studentKey'] || '';
    console.log("classKey", this.classKey);
    console.log("studentKey", this.studentKey);

    this.evaluationForm = new FormGroup({
      description: new FormControl(''),
      note: new FormControl(''),
      data: new FormControl(''),
      grid: new FormControl(''),
      classKey: new FormControl(this.classKey),
      studentKey: new FormControl(this.studentKey)
    });

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
    
    const evaluationKey = this.route.snapshot.queryParams['evaluationKey'];
    this.evaluationKey = evaluationKey;
    if (evaluationKey) {
      this.title = "rivedi valutazione";
      this.evaluationService.fetchEvaluation(evaluationKey).then((evaluation: Evaluation) => {
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
      this.title = "Nuova valutazione";
    }
    
    
  }

  async saveEvaluation() {
    if (this.evaluationForm.valid) {
      const evaluationData = this.evaluationForm.value;
    try {
      const evaluation = new Evaluation();
      const loggedUser = await this.$users.getLoggedUser();
      if(loggedUser){
        evaluation.teacherKey = loggedUser.key; 
      }
      
      // Get values from route parameters
  
      
      console.log("studentKey from route params", this.studentKey);
      console.log("classKey from route params", this.classKey);
      
      evaluation.studentKey = this.studentKey;
      evaluation.classKey = this.classKey;
      
      if(this.grid()){
        evaluation.grid = this.grid()!;
      }
      
      console.log("evaluation",evaluation);
        /* 
        if(this.evaluationKey()){
          this.evaluationService.updateEvaluation(this.evaluationKey(), evaluation);
        }else{
          this.evaluationService.addEvaluation(evaluation);
        }
        console.log('Saving evaluation:', evaluationData);
        this.toaster.showToast({
          message: 'Valutazione salvata con successo',
          duration: 3000,
          position: 'bottom'
        }); */
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
