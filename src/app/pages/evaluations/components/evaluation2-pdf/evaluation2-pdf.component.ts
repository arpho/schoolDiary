import { Component, ViewEncapsulation, input, OnInit, signal, inject, computed } from '@angular/core';
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
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-evaluation2-pdf',
  templateUrl: './evaluation2-pdf.component.html',
  styleUrls: ['./evaluation2-pdf.component.scss'],
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
export class Evaluation2PdfComponent  implements OnInit {
  showSpinner= signal(false);
close() {
this.modalCtrl.dismiss();
}
  hideButtons= signal(false);
  constructor(
    private $users:UsersService,
    private $class:ClassiService,
    private modalCtrl:ModalController
  
  ) { }

  formatDate(date:string){
    return  new Date(date).toLocaleDateString("it-IT", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
generatePdf() {
  this.hideButtons.set(true);
  this.showSpinner.set(true);
console.log("generatePdf");
const data = document.getElementById('contentToConvert');
if(data){
html2canvas(data).then(async canvas => {
  const imgWidth = 208;
  const pageHeight = 295;
  const imgHeight = canvas.height * imgWidth / canvas.width;
  const heightLeft = imgHeight;


  const contentDataURL = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF

  let position = 0;
  pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
  const user= await this.$users.fetchUserOnCache(this.evaluationData().studentKey);
  let userName="";
if (user){
userName=`${user.lastName}-${user.firstName}`
}

const classe= await this.$class.fetchClasseOnCache(this.evaluationData().classKey);
let className="";
if (classe){
className=classe.classe
}
const fileName = `evaluation_${userName}_${className}_${this.formatDate(this.evaluationData().data)}.pdf`;
  pdf.save(fileName); // Generated PDF
    });
}
this.hideButtons.set(false);
this.showSpinner.set(false);
}

  evaluation=input<Evaluation>();
  evaluationData=signal<Evaluation>(new Evaluation());
 votazione= computed(() => {
const max =  this.evaluationData().grid?.indicatori.reduce((acc: any, indicatore: { valore: any; }) => Number(acc) + Number(indicatore.valore), 0);
const voto = this.evaluationData().grid?.indicatori.reduce((acc: any, indicatore: { voto: any; }) => Number(acc) + Number(indicatore.voto), 0);
  return `${voto}/${max}`
 })

  ngOnInit() {
    this.evaluationData.set(new Evaluation(this.evaluation))
    console.log("evaluationData", this.evaluationData()); 
}}
