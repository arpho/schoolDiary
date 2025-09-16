import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-upload-button',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon]
})
export class UploadButtonComponent {
  @Input() onClick!: () => void;
}
