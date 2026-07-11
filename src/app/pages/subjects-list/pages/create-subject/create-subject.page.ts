import { Component, inject, model, OnInit, ChangeDetectionStrategy, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { form, schema, FormField, FormRoot, required } from '@angular/forms/signals';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { SubjectModel } from '../../models/subjectModel';

// Interfaccia per i parametri del modale
export interface CreateSubjectModalProps {
  subject?: {
    name: string;
    color: string;
    classeDiConcorso?: string;
    description?: string;
    icon?: string;
  };
}

// Palette di colori predefinita
const COLOR_PALETTE = [
  '#3880ff', '#3dc2ff', '#5260ff', '#2dd36f',
  '#ffc409', '#eb445a', '#92949c', '#222428',
  '#ff6b35', '#004e89', '#2ec4b6', '#e71d36'
];

/**
 * Pagina per la creazione o modifica di una materia.
 * Permette di impostare nome, colore e classe di concorso.
 */
@Component({
  selector: 'app-create-subject',
  templateUrl: './create-subject.page.html',
  styleUrls: ['./create-subject.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    FormsModule,
    FormField,
    FormRoot
]
})
export class CreateSubjectPage implements OnInit {
  // Model per il binding bidirezionale
  subject = model<{
    name: string;
    color: string;
    classeDiConcorso?: string;
    description?: string;
    icon?: string;
  } | null>(null);

  subjectModel = model({
    name: '',
    color: '#3880ff',
    classeDiConcorso: ''
  });

  subjectForm = form(this.subjectModel, schema((s) => {
    required(s.name);
  }));

  isEditMode = false;
  colorPalette = COLOR_PALETTE;

  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ closeOutline });
  }

  ngOnInit() {
    const subjectValue = this.subject();
    if (subjectValue) {
      this.isEditMode = true;
      this.subjectForm().patchValue({
        name: subjectValue.name || '',
        color: subjectValue.color || '#3880ff',
        classeDiConcorso: subjectValue.classeDiConcorso || ''
      });
    }
    else {
      console.log("nessuna materia passata")
    }
  }

  selectColor(color: string) {
    this.subjectForm().patchValue({ color });
  }

  save() {
    if (this.subjectForm().valid()) {
      const formValue = this.subjectForm().value();
      
      // Aggiorna il model con i nuovi valori
      this.subject.set(new SubjectModel({
        ...this.subject(),
        name: formValue.name.trim(),
        color: formValue.color,
        classeDiConcorso: formValue.classeDiConcorso?.trim()
      }));

      // Chiudi il modale con conferma
      this.modalCtrl.dismiss(this.subject(), 'confirm');
    }
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

}
