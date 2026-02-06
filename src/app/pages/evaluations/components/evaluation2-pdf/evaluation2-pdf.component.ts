import { Component, ViewEncapsulation, input, OnInit, signal, inject, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { Evaluation } from 'src/app/pages/evaluations/models/evaluation';
import { IonGrid, IonRow, IonCol, IonIcon, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from "@ionic/angular/standalone";
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
import { archive, create, ellipsisVertical, eyeOutline, trash, homeOutline, text, addCircle, removeCircle } from 'ionicons/icons';
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
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton
  ],
})
export class Evaluation2PdfComponent implements OnInit {
  gotoClassDialog() {
    this.router.navigate(['/class-dialog', this.evaluationData().classKey]);
  }
  showSpinner = signal(true);
  hideButtons = signal(false);

  // Font size management
  fontSize = signal(Number(localStorage.getItem('pdfFontSize')) || 14); // Default font size in px or from storage

  increaseFontSize() {
    this.fontSize.update(size => {
      const newSize = size + 1;
      localStorage.setItem('pdfFontSize', String(newSize));
      return newSize;
    });
  }

  decreaseFontSize() {
    this.fontSize.update(size => {
      const newSize = Math.max(10, size - 1);
      localStorage.setItem('pdfFontSize', String(newSize));
      return newSize;
    });
  }

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
      addCircle: addCircle,
      removeCircle: removeCircle,
    });
  }

  formatDate(date: any) {
    const d = this.sanitizeDate(date);
    if (!d) return '';
    return new Date(d).toLocaleDateString("it-IT", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-'); // Replace slashes with dashes for filename safety
  }
  /**
   * Genera un file PDF della valutazione corrente utilizzando html2canvas e jsPDF.
   * Nasconde i pulsanti durante la generazione per ottenere un documento pulito.
   */
  async generatePdf() {
    this.hideButtons.set(true);
    this.showSpinner.set(true);
    console.log("generatePdf");

    // Give UI a moment to update
    await new Promise(resolve => setTimeout(resolve, 100));

    const data = document.getElementById('contentToConvert');
    if (data) {
      try {
        const canvas = await html2canvas(data);
        const imgWidth = 208;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const position = 0;
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);

        const user = await this.$users.fetchUserOnCache(this.evaluationData().studentKey);
        let userName = "";
        if (user) {
          userName = `${user.lastName}-${user.firstName}`;
        }

        const classe = await this.$class.fetchClasseOnCache(this.evaluationData().classKey);
        let className = "";
        if (classe) {
          className = classe.classe;
        }

        const fileName = `evaluation_${userName}_${className}_${this.formatDate(this.evaluationData().data)}.pdf`;
        pdf.save(fileName);

      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    }

    this.showSpinner.set(false);
    this.hideButtons.set(false);
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
