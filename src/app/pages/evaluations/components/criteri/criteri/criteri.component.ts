import { Component, Input, OnInit } from '@angular/core';
import { Criterio } from 'src/app/shared/models/criterio';
import { IonList, IonItem, IonLabel } from "@ionic/angular/standalone";

@Component({
  selector: 'app-criteri',
  templateUrl: './criteri.component.html',
  styleUrls: ["./criteri.component.scss"],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonLabel,
],
})
export class CriteriComponent  implements OnInit {
  @Input() criteri: Criterio[] = [];

  constructor() { }

  ngOnInit() {
  }

}
