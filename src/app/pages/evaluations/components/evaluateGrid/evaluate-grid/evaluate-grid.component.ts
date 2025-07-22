import { Component, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { Grids } from 'src/app/shared/models/grids';
import { IonList, IonItem, IonLabel, IonCard, IonCardContent, IonCardHeader, IonGrid, IonRow, IonCol, IonInput, IonCardTitle, InputChangeEventDetail } from "@ionic/angular/standalone";
import { IndicatorViewerComponent } from "src/app/shared/components/indicatorsViewer/indicator-viewer/indicator-viewer.component";
import { IonInputCustomEvent } from '@ionic/core';
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
    IonCardContent,
    IonCardHeader,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
    IonCardTitle,
    CriteriComponent
],
})
export class EvaluateGridComponent  implements OnInit, OnChanges {
  voto = signal<number>(0);
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
const voto = this.grid.indicatori.reduce((acc, indicatore) => Number(acc) + Number(indicatore.voto), 0);
console.log("voto", voto);
this.voto.set(voto);
}
  @Input() grid: Grids = new Grids();

  constructor() { }

  ngOnInit() {
    console.log("grid to show", this.grid);
    this.votoMax = this.grid.indicatori.reduce((acc, indicatore) => Number(acc) + Number(indicatore.valore), 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['grid']) {
      console.log("grid changed", this.grid);
    }
  }
}
