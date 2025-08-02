import { Component, effect, model, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { UserModel } from 'src/app/shared/models/userModel';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButton,
  IonList,
  
  IonIcon } from '@ionic/angular/standalone';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';
import { addIcons } from 'ionicons';
import { refreshOutline } from 'ionicons/icons';
@Component({
  selector: 'app-filter-popup',
  templateUrl: './filter-popup.component.html',
  styleUrls: ['./filter-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonButton,
    IonList,
    IonIcon,
]
})
export class FilterPopupComponent implements OnInit {
resetFilter() {
this.classKey.set('');
this.studentKey.set('');
this.activityKey.set('');
this.fullText.set('');
this.filterform.patchValue({
  classKey: '',
  studentKey: '',
  activityKey: '',
  fullText: '',
});
}
  // Usa model invece di input per i parametri
  filter = model<QueryCondition[]>([]);
  listaClassi = model<ClasseModel[]>([]);
  listaStudenti = model<UserModel[]>([]);

  // Usa model per i valori del form
  classKey = model<string>('');
  studentKey = model<string>('');
  activityKey = model<string>('');
  fullText = model<string>('');
  listaAttivita = model<ActivityModel[]>([]);

  filterform: FormGroup = new FormGroup({
    classKey: new FormControl(''),
    studentKey: new FormControl(''),
    activityKey: new FormControl(''),
    fullText: new FormControl(''),
  });

  constructor() { 
    addIcons({
      refresh: refreshOutline,
    })
    effect(() => {
      console.log("listaClassi", this.listaClassi());
      console.log("filter", this.filter());
      console.log("listaAttivita", this.listaAttivita());
      console.log("listaStudenti", this.listaStudenti());
    })
  }
  

  ngOnInit() {


    // Usa i metodi model per aggiornare i valori
    this.classKey.set(this.filter().find((condition: QueryCondition) => condition.field === 'classKey')?.value || '');
    this.studentKey.set(this.filter().find((condition: QueryCondition) => condition.field === 'studentKey')?.value || '');
    this.activityKey.set(this.filter().find((condition: QueryCondition) => condition.field === 'activityKey')?.value || '');
    this.fullText.set(this.filter().find((condition: QueryCondition) => condition.field === 'fullText')?.value || '');

    // Aggiorna il form con i valori dei model
    this.filterform.patchValue({
      classKey: this.classKey(),
      studentKey: this.studentKey(),
      activityKey: this.activityKey(),
      fullText: this.fullText()
    });
    this.filterform.valueChanges.subscribe((value) => {
      console.log("value", value);
      this.classKey.set(value.classKey);
      this.studentKey.set(value.studentKey);
      this.activityKey.set(value.activityKey);
      this.fullText.set(value.fullText);
      this.filter.set([
        new QueryCondition('classKey', '==', value.classKey),
        new QueryCondition('studentKey', '==', value.studentKey),
        new QueryCondition('activityKey', '==', value.activityKey),
        new QueryCondition('fullText', '==', value.fullText)
      ].filter((condition: QueryCondition) => condition.value !== '')); 
      console.log("filter", this.filter());
    });
  }

}
