import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Grids } from 'src/app/shared/models/grids';
import { IonList, IonItem, IonLabel, IonCard, IonCardContent, IonCardHeader, IonGrid, IonRow, IonCol, IonInput, IonCardTitle, InputChangeEventDetail } from "@ionic/angular/standalone";
import { IndicatorViewerComponent } from "src/app/shared/components/indicatorsViewer/indicator-viewer/indicator-viewer.component";
import { IonInputCustomEvent } from '@ionic/core';
import { Indicatore } from 'src/app/shared/models/indicatore';
@Component({
  selector: 'app-evaluate-grid',
  templateUrl: './evaluate-grid.component.html',
  styleUrls: ['./evaluate-grid.component.scss'],
  imports: [
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
    IonCardTitle
],
})
export class EvaluateGridComponent  implements OnInit, OnChanges {
showCriteri(_t3: Indicatore) {
throw new Error('Method not implemented.');
}
setValue($event:any,indicatore: Indicatore) {
console.log("setting",indicatore,$event.detail.value);
console.log("valore", $event.detail.value);
}
  @Input() grid: Grids = new Grids(); 

  constructor() { }

  ngOnInit() {
    console.log("grid to show", this.grid);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['grid']) {
      console.log("grid changed", this.grid);
    }
  }
}
