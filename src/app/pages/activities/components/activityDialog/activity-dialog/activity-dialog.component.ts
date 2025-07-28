import { Component, EventEmitter, Input, OnInit, Output, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivityModel } from '../../../models/activityModel';
import { ClasseModel }  from 'src/app/pages/classes/models/classModel';
import { ModalController,
  IonDatetime,
  IonItem,
  IonLabel,
  IonInput,
    IonSelect,
  IonSelectOption,
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonFab,
  IonFabButton,
  IonTextarea,
  IonFabList,
  IonBackButton,
  IonCardSubtitle,
 } from '@ionic/angular/standalone';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-activity-dialog',
  templateUrl: './activity-dialog.component.html',
  styleUrls: ['./activity-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
   IonDatetime,
   IonItem,
   IonLabel,
   IonInput,
   IonSelect,
   IonSelectOption,
   IonButton,
   IonContent,
   IonHeader,
   IonTitle,
   IonToolbar,
   IonItem,
   IonList,
   IonCard,
   IonCardContent,
   IonCardHeader,
   IonCardTitle,
   IonIcon,
   IonFab,
   IonFabButton,
   IonFabList,
   IonBackButton,
     IonCardSubtitle,
   IonButton,
   IonTextarea
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ActivityDialogComponent implements OnInit {
saveActivity() {
console.log("activity ", this.activity());
this.modalController.dismiss(this.activity()); 
}

closeDialog() {
  console.log("activity ", this.activity());
this.modalController.dismiss();
}
onClassChange($event: any) {
console.log("class changed ", $event.target.value);
this.activity.set(new ActivityModel({
  ...this.activity(),
  classKey: $event.target.value
}));
}
onDescriptionChange($event: any) {
console.log("description changed ", $event.target.value);
this.activity.set(new ActivityModel({
  ...this.activity(),
  description: $event.target.value
}));
}
onTitleChange($event: any) {
console.log("title changed ", $event.target.value);
this.activity.set(new ActivityModel({
  ...this.activity(),
  title: $event.target.value
}));
}
  activity = model<ActivityModel>(new ActivityModel());
  activityForm: FormGroup = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    classKey: new FormControl(''),
    date: new FormControl('')
  });


  @Input() listaClassi: ClasseModel[] = [];
  constructor(
    private fb: FormBuilder,
    private modalController: ModalController
  ){}
  ngOnInit() {
    console.log("activity ", this.activity());
    console.log("listaClassi ", this.listaClassi);
    const activityValue = this.activity();
    console.log("Activity value:", activityValue); 

    // Inizializza il form con i valori dell'activity
    this.activityForm = this.fb.group({
      title: [activityValue.title || '', Validators.required],
      description: [activityValue.description || '', Validators.required],
      classKey: [activityValue.classKey || '', Validators.required],
      date: [activityValue.date || new Date().toISOString(), Validators.required]
    });

    // Sincronizza il form con l'oggetto activity
    this.activityForm.valueChanges.subscribe((value) => {
      console.log("Form value changed:", value);
      this.activity.set(new ActivityModel(value).setKey(this.activity().key).setTeacherKey(this.activity().teacherKey));
      console.log("Updated activity:", this.activity());
    });
  }

}
