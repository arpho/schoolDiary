import {
    Component,
    computed,
    EventEmitter,
    model,
    OnInit,
    Output,
    signal
} from '@angular/core';
import { IonTab, IonTabs, IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTextarea, IonItem, IonList } from '@ionic/angular/standalone';
import { Criterio } from 'src/app/shared/models/criterio';
import { Indicatore } from 'src/app/shared/models/indicatore';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';

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
    IonList
],
})
export class IndicatorsDialogComponent implements OnInit {
    valueCriterio= computed(() => {
        return  new Criterio({
            descrizione: this.criterioDescrizione(),
            valori: this.criterioValori()
        })
    });
pushCriterio() {
console.log("pushCriterio", this.valueCriterio());
this.criteri.set([...this.criteri(), this.valueCriterio()]);
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
        criteri: this.criteri()
    });
    this.indicatormodel.set(indicatore);
    console.log("indicatorModel", this.indicatormodel( ));
    this.indicatorpushed.emit(indicatore);
   

}
onDescrizioneChange($event: any) {
this.descrizione.set($event.target.value);
console.log("descrizione changed to ", this.descrizione());
}

    indicatormodel=model<Indicatore>(new Indicatore());
    descrizione=signal<string>('');
    criterioDescrizione=signal<string>('');
    criterioValori=signal<string>('');
    criteri=signal<Criterio[]>([]);
    criterio= computed(() => {
        return {
            descrizione: this.descrizione(),
            criteri: this.criteri()
        }
    });
    indicatorForm: FormGroup= new FormGroup({
        descrizione: new FormControl(""),
    });
    constructor(private fb: FormBuilder) {
        this.criterioForm = this.fb.group({
            descrizione: new FormControl("", Validators.required),
            valori: new FormControl("", Validators.required),
        });
    }

    ngOnInit(): void {
        this.indicatorForm = this.fb.group({
            descrizione: new FormControl(this.indicatormodel()?.descrizione, Validators.required),
            valori: new FormControl(this.indicatormodel()?.criteri?.[0]?.valori, Validators.required),
        });
    }
}
