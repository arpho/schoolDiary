import { Component, ViewEncapsulation, input, OnInit, signal, inject, computed } from '@angular/core';
import { Evaluation } from 'src/app/shared/models/evaluation';
import { IonGrid, IonRow, IonCol } from "@ionic/angular/standalone";
import { UserWieverComponent } from "src/app/shared/components/user-wiever/user-wiever.component";
import { ClassViewerComponent } from "src/app/shared/components/class-wiever/class-wiever.component";
import { DatePipe } from '@angular/common';
import { Indicatore } from 'src/app/shared/models/indicatore';
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
],
})
export class Evaluation2PdfComponent  implements OnInit {

  evaluation=input<Evaluation>();
  evaluationData=signal<Evaluation>(new Evaluation());
 votazione= computed(() => {
const max =  this.evaluationData().grid?.indicatori.reduce((acc, indicatore) => Number(acc) + Number(indicatore.valore), 0);
const voto = this.evaluationData().grid?.indicatori.reduce((acc, indicatore) => Number(acc) + Number(indicatore.voto), 0);
  return `${voto}/${max}`
 })
  constructor(
  ) { }

  ngOnInit() {
    this.evaluationData.set(new Evaluation(this.evaluation))
    console.log("evaluationData", this.evaluationData()); 
}}
