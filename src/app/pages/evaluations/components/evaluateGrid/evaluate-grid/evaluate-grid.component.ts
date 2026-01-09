import { Component, Input, OnInit, OnChanges, SimpleChanges, signal, model, output, effect } from '@angular/core';
import { Grids } from 'src/app/shared/models/grids';
import { IonList, IonItem, IonLabel, IonCard, IonGrid, IonRow, IonCol, IonInput, IonCardContent, IonContent } from "@ionic/angular/standalone";
import { IndicatorViewerComponent } from "src/app/shared/components/indicatorsViewer/indicator-viewer/indicator-viewer.component";

import { Indicatore } from 'src/app/shared/models/indicatore';
import { CriteriComponent } from "../../criteri/criteri/criteri.component";
/**
 * Componente per la compilazione della griglia di valutazione.
 * Gestisce l'input dei voti per ogni indicatore e calcola il totale.
 */
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
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
    IonContent,
    CriteriComponent
  ],
})
export class EvaluateGridComponent implements OnInit, OnChanges {
  voto = signal<number>(0);
  grid = model<Grids>(new Grids());
  votoMax = 0;

  // Aggiungo un output signal per la validità della griglia
  gridValid = output<boolean>();

  // Metodo per verificare se tutti gli indicatori hanno un voto valido
  private checkGridValidity(indicators: Indicatore[]): boolean {
    if (!indicators || indicators.length === 0) return false;
    return indicators.every(indicator =>
      indicator.voto !== null &&
      indicator.voto !== undefined &&
      !isNaN(Number(indicator.voto)) &&
      Number(indicator.voto) >= 0
    );
  }
  showCriteri(_t3: Indicatore) {
    throw new Error('Method not implemented.');
  }
  /**
   * Imposta il voto per un indicatore e ricalcola il totale.
   * @param $event L'evento di input contenente il nuovo valore o direttamente il valore numerico.
   * @param indicatore L'indicatore da aggiornare.
   */
  setValue($event: any, indicatore: Indicatore) {
    console.log("event", $event);
    console.log("setting", indicatore, $event);
    console.log("valore", $event);

    // Aggiorna il voto dell'indicatore
    indicatore.voto = Number($event);

    console.log("indicatore", indicatore);

    // Ricalcola il voto totale
    let voto = this.grid().indicatori.reduce((acc, indicatore) => {
      const votoNum = Number(indicatore.voto) || 0;
      return acc + (isNaN(votoNum) ? 0 : votoNum);
    }, 0);

    if (isNaN(voto)) {
      voto = Number($event.detail?.value) || 0;
    }

    console.log("voto", voto);
    this.voto.set(voto);

    // Verifica la validità della griglia e emetti il risultato
    const isValid = this.checkGridValidity(this.grid()?.indicatori || []);
    this.gridValid.emit(isValid);
  }

  constructor() {
    effect(() => {
      console.log("grid", this.grid());
      this.voto.set(this.grid().indicatori.reduce((acc, indicatore) => {
        const votoNum = Number(indicatore.voto) || 0;
        return acc + (isNaN(votoNum) ? 0 : votoNum);
      }, 0));
      this.votoMax = this.grid().indicatori.reduce((acc, indicatore) =>
        acc + (isNaN(Number(indicatore.valore)) ? 0 : Number(indicatore.valore)), 0);
    });
  }

  ngOnInit() {
    console.log("grid to show", this.grid);
    // Verifica iniziale della validità
    const initialValidity = this.checkGridValidity(this.grid()?.indicatori || []);
    this.gridValid.emit(initialValidity);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['grid'] && this.grid()) {
      this.votoMax = this.grid().indicatori.reduce((acc, indicatore) =>
        acc + (isNaN(Number(indicatore.valore)) ? 0 : Number(indicatore.valore)), 0);

      // Verifica la validità quando la griglia cambia
      const isValid = this.checkGridValidity(this.grid()?.indicatori || []);
      this.gridValid.emit(isValid);
    }
  }
}
