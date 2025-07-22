import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Criterio } from 'src/app/shared/models/criterio';
import { IonList, IonItem, AlertInput, AlertController } from "@ionic/angular/standalone";

@Component({
  selector: 'app-criteri',
  templateUrl: './criteri.component.html',
  styleUrls: ["./criteri.component.scss"],
  standalone: true,
  imports: [
    IonList,
    IonItem,

],
})
export class CriteriComponent  implements OnInit {
  @Output() selectedcriterio = new EventEmitter<number>();
  async selectedCriterio(_t3: Criterio) {
const alert = await this.alertCtrl.create({
  header: 'Confermi il puteggio del criterio?',
  message: 'Seleziona un criterio e attribuisci un valore',
  inputs: [
    {
      name: 'value',
      value: _t3.rangeValue,
      type: 'number',
      placeholder: 'Valore'
    }
  ],
  buttons: [
    {
      text: 'OK',
      handler: (alertData) => {
        console.log("value",alertData);
        console.log("value", alertData.value);
        this.selectedcriterio.emit(alertData.value);
        return true;

      }
    }
  ]
});
await alert.present();
}
  @Input() criteri: Criterio[] = [];

  constructor(
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

}
