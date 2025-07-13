import {
    Component,
    computed,
    effect,
    OnInit,
    signal
} from '@angular/core';

import {
    CommonModule
} from '@angular/common';
import {  ModalController } from '@ionic/angular';
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
    FormControl
} from '@angular/forms';

import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonRow, IonTitle, IonToolbar, IonTextarea, IonAccordion, IonAccordionGroup, IonFabButton, IonFab } from '@ionic/angular/standalone';

import {
    Criterio
} from 'src/app/shared/models/criterio';
import { addIcons } from 'ionicons';
import { add, push } from 'ionicons/icons';
import { Grids } from 'src/app/shared/models/grids';
import {
    IndicatorsListComponent
} from "../components/indicatorsList/indicators-list/indicators-list.component";
import { Router } from '@angular/router';
import { IndicatorsDialogComponent } from '../components/indicatorsDialog/indicators-dialog.component';
import { Indicatore } from 'src/app/shared/models/indicatore';
import { ActionSheetController } from '@ionic/angular';

@Component({
    selector: 'app-gridsdialog',
    templateUrl: './gridsdialog.html',
    styleUrls: ['./gridsdialog.scss'],
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonRow,
    IonTitle,
    IonToolbar,
    IonTextarea,
    IonAccordion,
    IonAccordionGroup,
    IndicatorsListComponent,
    IonFabButton,
    IonFab
]
})
export class GridsdialogPage implements OnInit{
  async selectIndicator(indicator: Indicatore,index: number) {
console.log("selectIndicator", indicator, index);
const actionSheet = await this.actionSheetController.create({
    header: 'Select an option',
    buttons: [
      {
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
         this.removeIndicator(index);
        },
      },
      {
        text: 'Edit',
        icon: 'create',
        handler: () => {
          this.editIndicator(indicator,index);
        },
      },
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        },
      },
    ],
  });
  await actionSheet.present();
}
  removeIndicator(index: number) {
    this.indicatorsList.set([...this.indicatorsList().slice(0,index), ...this.indicatorsList().slice(index+1)]);
  }
  async editIndicator(indicator: Indicatore, index: number) {
    console.log("editIndicator", indicator, index);
    const  modal = await this.modalController.create({
      component: IndicatorsDialogComponent,
      componentProps: {
        indicatore: indicator
      }
    });
    await modal.present();  
    modal.onDidDismiss().then((data) => {
      console.log("data", data);
      this.indicatorsList.set([...this.indicatorsList().slice(0,index), data.data, ...this.indicatorsList().slice(index+1)]);
    });
}
gridKey =""

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private router: Router,
    private actionSheetController: ActionSheetController,   
  ) {
    addIcons({push,add});
    effect(() => {
      console.log("indicatorsList", this.indicatorsList());
    });
    const navigation = this.router.getCurrentNavigation();
    this.gridKey = navigation?.extras.state?.['gridKey'];
    console.log("gridKey", this.gridKey);
  }
  async addIndicator() {
    const newIndicator = new Indicatore();
const modal = await this.modalController.create({
  component: IndicatorsDialogComponent,
  componentProps: {
    indicatore: newIndicator
  }
});
await modal.present();  
modal.onDidDismiss().then((data) => {
  console.log("data", data);
  this.indicatorsList.set([...this.indicatorsList(), data.data]);

});
}
  onNomeChange($event: any) {
this.nome.set($event.target.value);
console.log("nome changed to ", this.nome());
}
onDescrizioneChange($event: any) {
this.descrizione.set($event.target.value);
console.log("descrizione changed to ", this.descrizione());
}

  gridForm = new FormGroup({
    nome: new FormControl('', Validators.required),
    descrizione: new FormControl(''),
  });
  gridSignal= signal(new Grids());
indicatorsList = signal(this.gridSignal().indicatori);
nome = signal("");
descrizione = signal("");
valore = signal("");
formValue= computed(() => {
  return {
    nome: this.nome(),
    descrizione: this.descrizione(),
    indicatori: this.indicatorsList(),
    valore: this.valore()
  }
});

ngOnInit(): void {
  this.nome.set(this.gridSignal().nome);
  this.descrizione.set(this.gridSignal().descrizione);
  this.indicatorsList.set(this.gridSignal().indicatori);
  this.gridForm = this.fb.group({
    nome: new FormControl(this.nome(), Validators.required),
    descrizione: new FormControl(this.descrizione(), Validators.required),
  });
}

}
