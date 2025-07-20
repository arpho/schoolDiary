import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Grids } from 'src/app/shared/models/grids';
import { IonList, IonItem, IonLabel, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonPopover, IonContent } from "@ionic/angular/standalone";
@Component({
  selector: 'app-evaluate-grid',
  templateUrl: './evaluate-grid.component.html',
  styleUrls: ['./evaluate-grid.component.scss'],
  imports: [IonList,
    IonItem,
    IonLabel,
    IonList,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonPopover, IonContent],
})
export class EvaluateGridComponent  implements OnInit, OnChanges {
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
