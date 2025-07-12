import { Component, computed, effect, model, OnInit } from '@angular/core';
import { Indicatore } from 'src/app/shared/models/indicatore';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { IndicatorsDialogComponent } from "../../indicatorsDialog/indicators-dialog.component";
import { IonButton, IonContent, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
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
    IonLabel
],
})
export class IndicatorsListComponent  {

check() {
console.log("check", this.editingIndicator()!);
}
indicatorslist = model<any[]>([]);
editingIndicator = model<Indicatore>(new Indicatore());

  constructor(
    private service: GridsService
  ) { 
   
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

    console.log("indicatorsList",this.indicatorslist());
  }

}
