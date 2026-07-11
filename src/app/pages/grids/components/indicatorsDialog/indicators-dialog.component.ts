import {
  Component,
  computed,
  EventEmitter,
  Input,
  model,
  OnInit,
  Output,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { IonTab, IonTabs, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTextarea, IonItem, IonList, IonFab, IonFabButton, IonFabList } from '@ionic/angular/standalone';
import { Criterio } from 'src/app/shared/models/criterio';
import { Indicatore } from 'src/app/shared/models/indicatore';
import { FormsModule } from '@angular/forms';
import { form, schema, FormField, FormRoot, required } from '@angular/forms/signals';
import {
    AlertController,
    ActionSheetController,
    ModalController
} from '@ionic/angular';

/**
 * Componente per la gestione (creazione/modifica) di un indicatore.
 * Permette di definire descrizione, valori e lista di criteri associati.
 */
@Component({
    selector: 'app-indicators-dialog',
    templateUrl: './indicators-dialog.component.html',
    styleUrls: ['./indicators-dialog.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        IonTab,
        IonTabs,
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
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
        IonFabButton,
        IonFabList,
        FormField,
        FormRoot
    ],
})
export class IndicatorsDialogComponent implements OnInit {
    @Input() indicatore!: Indicatore;

    indicatorModel = signal({
      descrizione: '',
      valore: ''
    });

    indicatorForm = form(this.indicatorModel, schema((s) => {
      required(s.descrizione);
      required(s.valore);
    }));

    criteri = signal<Criterio[]>([]);

    constructor(
        private alertController: AlertController,
        private modalController: ModalController
    ) {}

    async selectCriterio(criterio: Criterio, index: number) {
        console.log("selectCriterio", criterio, index);
    }
    removeCriterio(index: number) {
        this.criteri.set([...this.criteri().slice(0, index), ...this.criteri().slice(index + 1)]);
    }
    async editCriterio(criterio: Criterio, index: number) {
        const alert = await this.alertController.create({
            header: 'modifica il criterio',
            subHeader: '',
            buttons: [{ text: 'Cancel', role: 'cancel' }, {
                text: 'OK', role: 'ok', handler: (data) => {
                    console.log(data);
                    const nuovoCriterio = new Criterio({
                        descrizione: data.descrizione,
                        valori: data.valori,
                    });
                    console.log("criterio", nuovoCriterio);
                    this.criteri.set([...this.criteri().slice(0, index), nuovoCriterio, ...this.criteri().slice(index + 1)]);
                }
            }],
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
            buttons: [{ text: 'Cancel', role: 'cancel' }, {
                text: 'OK', role: 'ok', handler: (data) => {
                    console.log(data);
                    const criterio = new Criterio({
                        descrizione: data.descrizione,
                        valori: data.valori,
                    });
                    console.log("criterio", criterio);
                    this.pushCriterio(criterio);
                }
            }],
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

    pushCriterio(criterio: Criterio) {
        this.criteri.set([...this.criteri(), criterio]);
    }

    title4criterio = computed(() => {
        return ` inserisci i criteri per
    ${this.indicatorModel().descrizione}`;
    });
    
    @Output() indicatorpushed = new EventEmitter<Indicatore>();
    
    pushIndicator() {
        console.log("pushIndicator");
        const indicatore = new Indicatore({
            descrizione: this.indicatorModel().descrizione,
            valore: this.indicatorModel().valore,
            criteri: this.criteri()
        });
        console.log("nuovo indicatore", indicatore);
        this.indicatorpushed.emit(indicatore);
        this.modalController.dismiss(indicatore);
    }

    ngOnInit(): void {
        console.log("indicatorsDialog ngOnInit", this.indicatore);
        this.criteri.set(this.indicatore?.criteri || []);
        
        this.indicatorForm().patchValue({
          descrizione: this.indicatore?.descrizione || '',
          valore: this.indicatore?.valore || ''
        });
    }
}
