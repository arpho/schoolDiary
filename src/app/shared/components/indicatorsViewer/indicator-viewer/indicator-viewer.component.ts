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

/**
 * Componente per visualizzare i dettagli di un indicatore.
 * Mostra le informazioni principali in una card.
 */
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
export class IndicatorViewerComponent implements OnInit {
  // TODO: Implementare la logica di rimozione e modifica
  removeIndicator(_t15: number) {
    throw new Error('Method not implemented.');
  }
  editIndicator(arg0: any, _t15: number) {
    throw new Error('Method not implemented.');
  }
  /** Indicatore da visualizzare */
  indicatore = input<Indicatore>();
  constructor() { }
  ngOnInit() { }

}
