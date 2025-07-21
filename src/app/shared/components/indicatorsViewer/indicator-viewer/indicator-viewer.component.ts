import { Component, input, OnInit } from '@angular/core';
import { Indicatore } from 'src/app/shared/models/indicatore';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonLabel,
  IonCardContent,
  IonList,
  IonItem,
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon 
 } from "@ionic/angular/standalone";

@Component({
  selector: 'app-indicator-viewer',
  templateUrl: './indicator-viewer.component.html',
  styleUrls: ['./indicator-viewer.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonLabel,
    IonCardContent,
    IonList,
    IonItem,
  ],
})
export class IndicatorViewerComponent  implements OnInit {
removeIndicator(_t15: number) {
throw new Error('Method not implemented.');
}
editIndicator(arg0: any,_t15: number) {
throw new Error('Method not implemented.');
}
  indicatore=input<Indicatore>();
  constructor() { }
  ngOnInit() {}

}
