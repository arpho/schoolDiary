import { Component, computed, effect, model, OnInit } from '@angular/core';
import { Indicatore } from 'src/app/shared/models/indicatore';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { IndicatorsDialogComponent } from "../../indicatorsDialog/indicators-dialog.component";
import { IonButton, IonContent, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { BehaviorSubject, first } from 'rxjs';
import { AsyncPipe } from '@angular/common';
/**
 * Componente che visualizza e gestisce una lista di indicatori.
 * Permette di aggiungere e modificare indicatori tramite dialogo.
 */
@Component({
  selector: 'app-indicators-list',
  templateUrl: './indicators-list.component.html',
  styleUrls: ['./indicators-list.component.scss'],
  standalone: true,
  imports: [
    IndicatorsDialogComponent,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
  ],
})
export class IndicatorsListComponent {
  $indicatorsListSubject = new BehaviorSubject<Indicatore[]>([]);
  readonly $indicatorsList$ = this.$indicatorsListSubject.asObservable();

  check() {
    console.log("check", this.editingIndicator()!);
  }
  indicatorslist = model<Indicatore[]>([]);
  editingIndicator = model<Indicatore>(new Indicatore());
  getLastIndicatorList(): Promise<Indicatore[]> {
    return new Promise((resolve) => {
      this.$indicatorsList$.pipe(first()).subscribe((indicators) => {
        resolve(indicators);
      });
    });
  }

  constructor(
    private service: GridsService
  ) {
    effect(async () => {
      const indicatori = this.indicatorslist()
      console.log("indicatorslist ths is the effect", indicatori)
      this.indicatorslist.set(indicatori);
    });
    this.$indicatorsList$.subscribe((indicators) => {
      console.log(" subscribed indicatorslist", indicators);

    });
  }



  addIndicator(indicatore: Indicatore) {
    console.log("pushing indicator", indicatore);
    if (indicatore) {
      this.indicatorslist.set([...this.indicatorslist(), indicatore]);
    }
    console.log("indicatorslist", this.indicatorslist());
    this.editingIndicator.set(new Indicatore());
  }


  ngOnInit() {
    this.$indicatorsListSubject.next(this.indicatorslist());
    console.log("indicatorsList", this.indicatorslist());
  }

}
