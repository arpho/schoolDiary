import { Component, Input, OnInit, OnChanges, SimpleChanges, signal, model } from '@angular/core';
import { Grids } from 'src/app/shared/models/grids';
import { IonList, IonItem, IonLabel, IonCard, IonGrid, IonRow, IonCol, IonInput } from "@ionic/angular/standalone";
import { IndicatorViewerComponent } from "src/app/shared/components/indicatorsViewer/indicator-viewer/indicator-viewer.component";

import { Indicatore } from 'src/app/shared/models/indicatore';
import { CriteriComponent} from "../../criteri/criteri/criteri.component";
@Component({
  selector: 'app-evaluate-grid',
  templateUrl: './evaluate-grid.component.html',
  styleUrls: ['./evaluate-grid.component.scss'],
  imports: [
    IonList,
    IonItem,
    IonLabel,
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
    CriteriComponent
],
})
export class EvaluateGridComponent  implements OnInit, OnChanges {
  voto = signal<number>(0);
 grid = model<Grids>(new Grids());
  votoMax = 0
showCriteri(_t3: Indicatore) {
throw new Error('Method not implemented.');
}
setValue($event:any,indicatore: Indicatore) {
  console.log("event",$event)
console.log("setting",indicatore,$event);
console.log("valore", $event);
indicatore.voto = Number($event);
console.log("indicatore", indicatore);
let voto = this.grid().indicatori.reduce((acc, indicatore) => Number(acc) + Number(indicatore.voto), 0);
if(Number.isNaN(voto)){
  voto =  Number($event.detail.value);
}
console.log("voto", voto);
this.voto.set(voto);
}

  constructor() { }

  ngOnInit() {
    console.log("grid to show", this.grid);
    this.votoMax = this.grid().indicatori.reduce((acc, indicatore) => Number(acc) + Number(indicatore.valore), 0);
    }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['grid']) {
      console.log("grid changed", this.grid);
    }
  }
}
