import { Component, inject, model, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-create-subject',
  templateUrl: './create-subject.page.html',
  styleUrls: ['./create-subject.page.scss'],
  standalone: true,
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
    CommonModule, 
    FormsModule
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
  
  name: string = '';
  color: string = '#3880ff';
  classeDiConcorso: string = '';
  isEditMode = false;
  selectedColor = '#3880ff';
  colorPalette = COLOR_PALETTE;

  private modalCtrl = inject(ModalController);
  
  constructor() {
    addIcons({ closeOutline });
  }

  ngOnInit() {
    const subjectValue = this.subject();
    if (subjectValue) {
      this.isEditMode = true;
      this.name = subjectValue.name || '';
      this.color = subjectValue.color || '#3880ff';
      this.selectedColor = subjectValue.color || '#3880ff';
      this.classeDiConcorso = subjectValue.classeDiConcorso || '';
    }
    else{
      console.log("nessuna materia passata")
    }
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  save() {
    if (this.name.trim()) {
      // Aggiorna il model con i nuovi valori
      this.subject.set( new SubjectModel({
        ...this.subject(),
        name: this.name.trim(),
        color: this.selectedColor,
        classeDiConcorso: this.classeDiConcorso?.trim()
      }));
      
      // Chiudi il modale con conferma
      this.modalCtrl.dismiss(this.subject(), 'confirm');
    }
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onNameChange(value: string) {
    this.name = value?.trim() || '';
  }

  onClasseDiConcorsoChange(value: string) {
    this.classeDiConcorso = value?.trim() || '';
  }
}
