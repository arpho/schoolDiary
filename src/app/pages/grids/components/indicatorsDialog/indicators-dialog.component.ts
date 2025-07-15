import {
    Component,
    computed,
    EventEmitter,
    Input,
    model,
    OnInit,
    Output,
    signal
} from '@angular/core';
import {
    IonTab, IonTabs, IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTextarea, IonItem, IonList, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { Criterio } from 'src/app/shared/models/criterio';
import { Indicatore } from 'src/app/shared/models/indicatore';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { AlertController, ActionSheetController, ModalController } from '@ionic/angular';

@Component({
    selector: 'app-indicators-dialog',
    templateUrl: './indicators-dialog.component.html',
    styleUrls: ['./indicators-dialog.component.scss'],
    standalone: true,
    imports: [
    FormsModule,
    ReactiveFormsModule,
    IonTab,
    IonTabs,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonIcon,
    IonLabel,
    IonTabBar,
    IonTabButton,
    IonTextarea,
    IonItem,
    IonList,
    IonFab,
    IonFabButton
],
})
export class IndicatorsDialogComponent implements OnInit {
onIndicatorValueChange($event: any) {
this.indicatorValue.set($event.target.value);
console.log("indicatorValue changed to ", this.indicatorValue());
}
    @Input() indicatore!: Indicatore;
    descrizione=signal<string>('');
    indicatorValue=signal<string>(''); 
    criterioDescrizione=signal<string>('');
    criterioValori=signal<string>('');
    criteri=signal<Criterio[]>([]);
    criterio= computed(() => {
        return {
            descrizione: this.descrizione(),
            valore: this.indicatorValue(),
            criteri: this.criteri()
        }
    });
    indicatorForm: FormGroup= new FormGroup({
        descrizione: new FormControl(""),
        valore: new FormControl(""),
    });
    constructor(
        private fb: FormBuilder,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController    
    ) { 
        this.criterioForm = this.fb.group({
            descrizione: new FormControl("", Validators.required),
            valori: new FormControl("", Validators.required),
        });
    }
    async selectCriterio(criterio: Criterio,index: number) {
console.log("selectCriterio", criterio, index);
const actionSheet = await this.actionSheetController.create({
    header: 'Select an option',
    buttons: [
      {
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
         this.removeCriterio(index);
        },
      },
      {
        text: 'Edit',
        icon: 'create',
        handler: () => {
          this.editCriterio(criterio,index);
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
    removeCriterio(index: number) {
        this.criteri.set([...this.criteri().slice(0,index), ...this.criteri().slice(index+1)]);
    }
    async editCriterio(criterio: Criterio, index: number) {
        const alert = await this.alertController.create({
            header: 'modifica il criterio',
            subHeader: '',
            buttons: [{text: 'Cancel', role: 'cancel'}, {text: 'OK', role: 'ok', handler: (data) => {
                console.log(data);
                const criterio = new Criterio({
                    descrizione: data.descrizione,
                    valori: data.valori,
                });
                console.log("criterio", criterio);
                this.criteri.set([...this.criteri().slice(0,index), criterio, ...this.criteri().slice(index+1)]);
            }}],
            inputs: [
                {
                    name: 'descrizione',
                    type: 'text',
                    value: criterio.descrizione,
                    placeholder: 'descrizione',
                },
                {
                    name: 'valori',
                    value: criterio.valori,
                    type: 'text',
                    placeholder: 'valori',
                },
            ],
          });
      
          await alert.present();
    }
    async addCriterio() {
    const alert = await this.alertController.create({
        header: 'inserisci il criterio',
        subHeader: '',
        message: 'A message should be a short, complete sentence.',
        buttons: [{text: 'Cancel', role: 'cancel'}, {text: 'OK', role: 'ok', handler: (data) => {
            console.log(data);
            const criterio = new Criterio({
                descrizione: data.descrizione,
                valori: data.valori,
            });
            console.log("criterio", criterio);
            //this.criteri.set([...this.criteri(), criterio]);
            this.pushCriterio(criterio);
        }}],
        inputs: [
            {
                name: 'descrizione',
                type: 'text',
                placeholder: 'descrizione',
            },
            {
                name: 'valori',
                type: 'text',
                placeholder: 'valori',
            },
        ],
      });
  
      await alert.present();
}
    valueCriterio= computed(() => {
        return  new Criterio({
            descrizione: this.criterioDescrizione(),
            valori: this.criterioValori()
        })
    });
pushCriterio(criterio: Criterio) {
console.log("pushCriterio", this.valueCriterio());
this.criteri.set([...this.criteri(), criterio]);
}
onValoriCriterioChange($event: any) {
this.criterioValori.set($event.target.value);
console.log("valori changed to ", this.criterioValori());
}
onDescrizioneCriterioChange($event: any) {
this.criterioDescrizione.set($event.target.value);
console.log("descrizione changed to ", this.criterioDescrizione());
}
    criterioForm: FormGroup=new FormGroup({
        descrizione: new FormControl("", Validators.required),
        valori: new FormControl("", Validators.required),
    });
title4criterio = computed(() => {
    return ` inserisci i criteri per 
    ${this.descrizione()}`;
});
    @Output() indicatorpushed = new EventEmitter<Indicatore>();
pushIndicator() {

    console.log("pushIndicator");
    const indicatore = new Indicatore({
        descrizione: this.descrizione(),
        valore: this.indicatorValue(),
        criteri: this.criteri()
    });
    console.log("nuovo indicatore", indicatore);
    this.indicatorpushed.emit(indicatore);
    this.modalController.dismiss(indicatore);
   

}
onDescrizioneChange($event: any) {
this.descrizione.set($event.target.value);
console.log("descrizione changed to ", this.descrizione());
}


    ngOnInit(): void {
        console.log("indicatorsDialog ngOnInit", this.indicatore);    
        this.criteri.set(this.indicatore?.criteri);
        this.indicatorForm = this.fb.group({
            descrizione: new FormControl(this.indicatore?.descrizione, Validators.required),
            valore: new FormControl(this.indicatore?.valore, Validators.required),
        });
        this.descrizione.set(this.indicatore?.descrizione);
        this.indicatorValue.set(this.indicatore?.valore);
    }
}
