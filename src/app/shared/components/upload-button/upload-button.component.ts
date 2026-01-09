import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

/**
 * Pulsante riutilizzabile per il caricamento di file.
 * Accetta una funzione di callback `onClick`.
 */
@Component({
  selector: 'app-upload-button',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon]
})
export class UploadButtonComponent {
  /** Funzione da eseguire al click */
  @Input() onClick!: () => void;
}
