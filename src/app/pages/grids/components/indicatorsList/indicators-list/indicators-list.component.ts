import { Component, computed, effect, model, OnInit } from '@angular/core';
import { Indicatore } from 'src/app/shared/models/indicatore';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { IndicatorsDialogComponent } from "../../indicatorsDialog/indicators-dialog.component";
import { IonButton, IonContent, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { BehaviorSubject, first } from 'rxjs';
import { AsyncPipe } from '@angular/common';
@Component({
  selector: 'app-indicators-list',
  templateUrl: './indicators-list.component.html',
  styleUrls: ['./indicators-list.component.scss'],
  imports: [
    IndicatorsDialogComponent,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    AsyncPipe
],
})
export class IndicatorsListComponent  {
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
    const indicatore = this.editingIndicator()
    console.log("editingIndicator ths is the effect", indicatore)
    const actualList = await this.getLastIndicatorList();
    this.$indicatorsListSubject.next([...actualList?actualList:[], indicatore]);
  });
  this.$indicatorsList$.subscribe((indicators) => {
    console.log(" subscribed indicatorslist", indicators);
  
  });
}

   

  addIndicator(indicatore: any) {
    console.log("pushing indicator", indicatore);
    if(indicatore){
      this.indicatorslist.set([...this.indicatorslist(), indicatore]);
    }
    console.log("indicatorslist", this.indicatorslist());
    this.editingIndicator.set(new Indicatore());  
  }
  

  ngOnInit() {
this.$indicatorsListSubject.next(this.indicatorslist());
    console.log("indicatorsList",this.indicatorslist());
  }

}
