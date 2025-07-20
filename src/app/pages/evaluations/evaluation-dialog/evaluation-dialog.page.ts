import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { 
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
  IonTextarea
} from '@ionic/angular/standalone';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { Grids } from 'src/app/shared/models/grids';
import { Evaluation } from 'src/app/shared/models/evaluation';
import { EvaluationService } from '../services/evaluation/evaluation.service';
@Component({
  selector: 'app-evaluation-dialog',
  templateUrl: './evaluation-dialog.page.html',
  styleUrls: ['./evaluation-dialog.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterOutlet,
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
    IonTextarea]
})
export class EvaluationDialogPage implements OnInit {
  valutazione=signal<Evaluation>(new Evaluation())
  title=""
  griglie=signal<Grids[]>([])
  grid=signal<Grids>(new Grids())
  classKey=signal<string>("")
  studentKey=signal<string>("")
  evaluationKey=signal<string>("")
  evaluationForm: FormGroup = new FormGroup({
    description: new FormControl(''),
    note: new FormControl(''),
    data: new FormControl(''),
    grid: new FormControl(''),
    classeKey: new FormControl(''),
    studentKey: new FormControl('')
  });

  constructor(
    private route: ActivatedRoute,
    private toaster: ToasterService,
    private fb: FormBuilder,
    private gridsService: GridsService,
    private evaluationService: EvaluationService  
  ) { }

  ngOnInit() {
    this.evaluationForm.controls['grid'].valueChanges.subscribe((gridKey: string | null) => {
      if (gridKey) {
        const grid = this.griglie().find(g => g.key === gridKey);
        console.log("Selected grid", gridKey);
        if (grid) {
          this.grid.set(grid)
          console.log("Selected grid", this.grid())
        }
      }
    });
    
    this.gridsService.getGridsOnRealtime((grids: Grids[]) => {
      this.griglie.set(grids);
    });
    
    const evaluationKey = this.route.snapshot.params['evaluationKey'];
    this.evaluationKey.set(evaluationKey);
    if(evaluationKey){
      this.title="rivedi valutazione"
      this.evaluationService.fetchEvaluation(evaluationKey).then((evaluation: Evaluation) => {
        
        this.valutazione.set(evaluation);
        this.evaluationForm.patchValue({
          description: evaluation.description,
          note: evaluation.note,
          data: evaluation.data,
          grid: evaluation.grid.key,
          classeKey: evaluation.classeKey,
          studentKey: evaluation.studentKey
        });
      });
      const studentKey = this.route.snapshot.queryParams['studentKey'];
    console.log("studentKey",studentKey);
    this.studentKey.set(studentKey);
    const classKey = this.route.snapshot.queryParams['classeKey'];
    this.classKey.set(classKey);
    }else{
      this.title="Nuova valutazione"
    }
    
    
  }

  async saveEvaluation() {
    if (this.evaluationForm.valid) {
      const evaluationData = this.evaluationForm.value;
      try {
        const evaluation = new Evaluation();
        evaluation.build(evaluationData);
        
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
