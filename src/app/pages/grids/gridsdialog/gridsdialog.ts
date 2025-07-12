import {
    Component,
    computed,
    OnInit,
    signal
} from '@angular/core';

import {
    CommonModule
} from '@angular/common';
import { NavParams, ModalController } from '@ionic/angular';
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
    FormControl
} from '@angular/forms';

import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonRow, IonTitle, IonToolbar, IonTextarea, IonAccordion, IonAccordionGroup } from '@ionic/angular/standalone';

import {
    Criterio
} from 'src/app/shared/models/criterio';
import { addIcons } from 'ionicons';
import { push } from 'ionicons/icons';
import { Grids } from 'src/app/shared/models/grids';
import { IndicatorsListComponent } from "../components/idicatorsList/indicators-list/indicators-list.component";

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
    IndicatorsListComponent
]
})
export class GridsdialogPage implements OnInit{
  gridForm = new FormGroup({
    nome: new FormControl('', Validators.required),
    descrizione: new FormControl(''),
  });
  gridSignal= signal(new Grids());
indicatorsList = signal(this.gridSignal().indicatori);
nome = signal("");
descrizione = signal("");
formValue= computed(() => {
  return {
    nome: this.nome(),
    descrizione: this.descrizione(),
    indicatori: this.indicatorsList()
  }
});


  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private fb: FormBuilder
  ) {
    addIcons({push});
  }

ngOnInit(): void {
  this.gridSignal.set(this.navParams.get('grid'));
  this.nome.set(this.gridSignal().nome);
  this.descrizione.set(this.gridSignal().descrizione);
  this.indicatorsList.set(this.gridSignal().indicatori);
  this.gridForm = this.fb.group({
    nome: new FormControl(this.nome(), Validators.required),
    descrizione: new FormControl(this.descrizione(), Validators.required),
  });
}

}
