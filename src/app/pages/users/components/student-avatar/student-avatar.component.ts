import {
  Component, input, output, signal, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { IonButton, IonIcon, IonSpinner, IonModal, IonContent, IonHeader,
         IonToolbar, IonTitle, IonButtons, IonFooter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, closeOutline, checkmarkOutline, trashOutline } from 'ionicons/icons';
import { StudentPhotoService } from '../../services/student-photo.service';

/**
 * Componente avatar studente.
 * Mostra la foto profilo (o le iniziali su sfondo colorato) e permette
 * l'upload con ritaglio 1:1 tramite ngx-image-cropper.
 */
@Component({
  selector: 'app-student-avatar',
  templateUrl: './student-avatar.component.html',
  styleUrls: ['./student-avatar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ImageCropperComponent,
    IonButton, IonIcon, IonSpinner, IonModal, IonContent,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonFooter
  ]
})
export class StudentAvatarComponent {
  /** Chiave dello studente (usata per il path su Storage) */
  userKey = input.required<string>();
  /** URL attuale della foto profilo */
  photoUrl = input<string>('');
  /** Nome dello studente (per le iniziali) */
  firstName = input<string>('');
  /** Cognome dello studente (per le iniziali) */
  lastName = input<string>('');
  /** Emette il nuovo URL dopo l'upload */
  photoChanged = output<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Stato del cropper
  imageChangedEvent = signal<Event | null>(null);
  croppedBlob = signal<Blob | null>(null);
  cropperOpen = signal(false);
  uploading = signal(false);

  constructor(private photoService: StudentPhotoService) {
    addIcons({
      'camera-outline': cameraOutline,
      'close-outline': closeOutline,
      'checkmark-outline': checkmarkOutline,
      'trash-outline': trashOutline
    });
  }

  /** Calcola le iniziali per il fallback avatar */
  get initials(): string {
    const f = this.firstName()?.charAt(0)?.toUpperCase() || '';
    const l = this.lastName()?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  }

  /** Calcola un colore deterministico basato sul nome */
  get avatarColor(): string {
    const name = (this.firstName() + this.lastName()).toLowerCase();
    const colors = [
      '#1976D2', '#388E3C', '#7B1FA2', '#F57C00',
      '#D32F2F', '#0097A7', '#5D4037', '#455A64'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  openFilePicker() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    this.imageChangedEvent.set(event);
    this.cropperOpen.set(true);
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.blob) {
      this.croppedBlob.set(event.blob);
    }
  }

  closeCropper() {
    this.cropperOpen.set(false);
    this.imageChangedEvent.set(null);
    this.croppedBlob.set(null);
    this.fileInput.nativeElement.value = '';
  }

  async confirmCrop() {
    const blob = this.croppedBlob();
    const key = this.userKey();
    if (!blob || !key) return;

    this.uploading.set(true);
    try {
      const url = await this.photoService.uploadPhoto(key, blob);
      this.photoChanged.emit(url);
      this.closeCropper();
    } catch (e) {
      console.error('Errore upload foto:', e);
    } finally {
      this.uploading.set(false);
    }
  }
}
