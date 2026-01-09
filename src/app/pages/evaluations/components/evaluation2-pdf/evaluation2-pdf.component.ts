import { Component, ViewEncapsulation, input, OnInit, signal, inject, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { Evaluation } from 'src/app/pages/evaluations/models/evaluation';
import { IonGrid, IonRow, IonCol, IonButton, IonFabButton, IonFab, IonFabList, IonIcon, IonHeader, IonContent, IonToolbar, IonTitle } from "@ionic/angular/standalone";
import { UserWieverComponent } from "src/app/shared/components/user-wiever/user-wiever.component";
import { ClassViewerComponent } from "src/app/shared/components/class-wiever/class-wiever.component";
import { DatePipe } from '@angular/common';
import { Indicatore } from 'src/app/shared/models/indicatore';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { UsersService } from 'src/app/shared/services/users.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { IonicModule } from "@ionic/angular";
import { ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { archive, create, ellipsisVertical, eyeOutline, trash, homeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { print } from 'ionicons/icons';
import { close } from 'ionicons/icons';
/**
 * Componente per generare la visualizzazione stampabile (PDF) di una valutazione.
 * Mostra i dettagli della valutazione, la griglia compilata e permette il salvataggio in PDF.
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-evaluation2-pdf',
  templateUrl: './evaluation2-pdf.component.html',
  styleUrls: ['./evaluation2-pdf.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    IonGrid,
    IonRow,
    IonCol,
    UserWieverComponent,
    ClassViewerComponent,
    IonButton,
    IonFabButton,
    IonFab,
    IonIcon,
    IonFabList,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle
  ],
})
export class Evaluation2PdfComponent implements OnInit {
  gotoClassDialog() {
    this.router.navigate(['/class-dialog', this.evaluationData().classKey]);
  }
  showSpinner = signal(true);

  hideButtons = signal(false);
  constructor(
    private $users: UsersService,
    private router: Router,
    private $class: ClassiService,
    private route: ActivatedRoute,
    private $evaluation: EvaluationService

  ) {
    effect(async () => {
      const evaluationKey = this.route.snapshot.paramMap.get('evaluationKey');
      if (evaluationKey) {
        const evaluation = await this.$evaluation.fetchEvaluation(evaluationKey);
        console.log("evaluation", evaluation);
        this.evaluationData.set(evaluation);
      }
    });
    addIcons({
      eyeOutline: eyeOutline,
      print: print,
      ellipsisVertical: ellipsisVertical,
      create: create,
      archive: archive,
      trash: trash,
      close: close,
      home: homeOutline,
    });
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString("it-IT", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  /**
   * Genera un file PDF della valutazione corrente utilizzando html2canvas e jsPDF.
   * Nasconde i pulsanti durante la generazione per ottenere un documento pulito.
   */
  generatePdf() {
    this.hideButtons.set(true);
    this.showSpinner.set(false);
    console.log("generatePdf");
    const data = document.getElementById('contentToConvert');
    if (data) {
      html2canvas(data).then(async canvas => {
        const imgWidth = 208;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const heightLeft = imgHeight;


        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF

        let position = 0;
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        const user = await this.$users.fetchUserOnCache(this.evaluationData().studentKey);
        let userName = "";
        if (user) {
          userName = `${user.lastName}-${user.firstName}`
        }

        const classe = await this.$class.fetchClasseOnCache(this.evaluationData().classKey);
        let className = "";
        if (classe) {
          className = classe.classe
        }
        const fileName = `evaluation_${userName}_${className}_${this.formatDate(this.evaluationData().data)}.pdf`;
        pdf.save(fileName); // Generated PDF
        this.showSpinner.set(false);
      });
    }
    this.hideButtons.set(false);
    this.showSpinner.set(false);
  }

  evaluation = input<Evaluation>();
  evaluationData = signal<Evaluation>(new Evaluation());
  votazione = computed(() => {
    const max = this.evaluationData().grid?.indicatori.reduce((acc: any, indicatore: { valore: any; }) => Number(acc) + Number(indicatore.valore), 0);
    const voto = this.evaluationData().grid?.indicatori.reduce((acc: any, indicatore: { voto: any; }) => Number(acc) + Number(indicatore.voto), 0);
    return `${voto}/${max}`
  })

  ngOnInit() {
    this.showSpinner.set(false);
    this.route.paramMap.subscribe(async params => {
      const evaluationKey = params.get('evaluationKey');
      console.log('Evaluation Key:', evaluationKey);
      if (evaluationKey) {
        const evaluation = await this.$evaluation.fetchEvaluation(evaluationKey);
        console.log("evaluation", evaluation);
        console.log("show spinner", this.showSpinner());
        this.evaluationData.set(evaluation);
      }

      // Usa il parametro come necessario
    });


    console.log("evaluationData", this.evaluationData());
  }

  sanitizeDate(date: any) {
    return date?.toDate ? date.toDate() : date
  }

}
