import { Component, input, OnInit } from '@angular/core';
import { Indicatore } from 'src/app/shared/models/indicatore';
import { IonCard, IonCardHeader, IonCardTitle, IonLabel, IonCardContent, IonList, IonItem } from "@ionic/angular/standalone";

@Component({
  selector: 'app-indicator-viewer',
  templateUrl: './indicator-viewer.component.html',
  styleUrls: ['./indicator-viewer.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardHeader, IonCardTitle, IonLabel, IonCardContent, IonList, IonItem],
})
export class IndicatorViewerComponent  implements OnInit {
  indicatore=input<Indicatore>();
  constructor() { }
  ngOnInit() {}

}
