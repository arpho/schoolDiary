import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar,
   IonList,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonIcon,
  IonFabList,
  ModalController,
  AlertController } from '@ionic/angular/standalone';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { Evaluation } from '../../../../shared/models/evaluation';
import { addIcons } from 'ionicons';
import {
   create,
   archive,
   ellipsisVertical,
   trash,
   close,
   print } from 'ionicons/icons';
import { EvaluationDialogPage } from '../../evaluation-dialog/evaluation-dialog.page';
import { Evaluation2PdfComponent } from '../../components/evaluation2-pdf/evaluation2-pdf.component';

@Component({
  selector: 'app-evaluations-list',
  templateUrl: './evaluations-list.page.html',
  styleUrls: ['./evaluations-list.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonFab,
    IonFabButton,
    IonIcon,
    IonFabList,
    DatePipe
  ]
})
export class EvaluationsListPage implements OnInit {
  async evaluationPdf(valutazione: Evaluation) {
console.log("evaluationPdf", valutazione);
const modal = await this.modalCtrl.create({
  component: Evaluation2PdfComponent,
  componentProps: {
    evaluation: valutazione
  }
});
await modal.present(); 
}
  evaluationsList = [] as Evaluation[];

  private modalCtrl = inject(ModalController);

  constructor(
    private $service: EvaluationService
  ) { 
    addIcons({
      create,
      archive,
      ellipsisVertical,
      trash,
      close,
      print
    });
  }

  ngOnInit() {
    this.$service.getEvaluationsOnRealtime((evaluations: Evaluation[]) => {
      console.log("evaluations", evaluations);
      this.evaluationsList = evaluations;
    });
  }

  async editEvaluation(evaluation: Evaluation) {
    // Implement edit logic
    console.log('Editing evaluation:', evaluation);
    const modal = await this.modalCtrl.create({
      component: EvaluationDialogPage,
      componentProps: {
        evaluation: evaluation
      },
      cssClass: "fullscreen"
    });
    await modal.present();
  }

  archiveEvaluation(evaluation: Evaluation) {
    // Implement archive logic
    console.log('Archiving evaluation:', evaluation);
  }

  deleteEvaluation(evaluation: Evaluation) {
    // Implement delete logic
    console.log('Deleting evaluation:', evaluation);
  }
}
