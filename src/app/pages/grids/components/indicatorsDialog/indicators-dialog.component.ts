import {
    Component,
    computed,
    model,
    OnInit,
    signal
} from '@angular/core';
import { IonTab, IonTabs, IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTextarea, IonItem } from '@ionic/angular/standalone';
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
    IonItem
],
})
export class IndicatorsDialogComponent implements OnInit {
pushIndicator() {

    console.log("pushIndicator");
    const indicatore = new Indicatore({
        descrizione: this.descrizione(),
        criteri: this.criteri()
    });
    this.indicatorModel.set(indicatore);
    console.log("indicatorModel", this.indicatorModel( ));

}
onDescrizioneChange($event: any) {
this.descrizione.set($event.target.value);
console.log("descrizione changed to ", this.descrizione());
}
saveIndicator() {
throw new Error('Method not implemented.');
}
    indicatorModel=model<Indicatore>(new Indicatore());
    descrizione=signal<string>('');
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
    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.indicatorForm = this.fb.group({
            descrizione: new FormControl(this.indicatorModel().descrizione, Validators.required),
        });
    }
}
