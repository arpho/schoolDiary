import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonInput,
  IonButton,
  IonButtons,
  IonLabel,
  IonItem,
  ModalController
} from '@ionic/angular/standalone';

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
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonInput, 
    IonButton, 
    IonButtons, 
    IonLabel,
    IonItem
  ]
})
export class CreateSubjectPage {
  name = '';
  classeDiConcorso = '';
  selectedColor = '#3880ff';
  colorPalette = COLOR_PALETTE;

  constructor(private modalController: ModalController) {}

  selectColor(color: string) {
    this.selectedColor = color;
  }

  save() {
    if (this.name.trim()) {
      this.modalController.dismiss({
        name: this.name.trim(),
        color: this.selectedColor,
        classeDiConcorso: this.classeDiConcorso.trim() || undefined
      });
    }
  }

  cancel() {
    this.modalController.dismiss();
  }
}
