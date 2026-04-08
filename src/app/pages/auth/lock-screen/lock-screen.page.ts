import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput,
  IonButton,
  IonInputPasswordToggle,
  IonCard,
  IonCardContent,
  IonIcon,
  IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, lockOpenOutline, logOutOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { LocalLockService } from 'src/app/shared/services/local-lock.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';

@Component({
  selector: 'app-lock-screen',
  templateUrl: './lock-screen.page.html',
  styleUrls: ['./lock-screen.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonInput,
    IonButton,
    IonInputPasswordToggle,
    IonCard,
    IonCardContent,
    IonIcon,
    IonText
  ]
})
export class LockScreenPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private localLockService = inject(LocalLockService);
  private usersService = inject(UsersService);
  private toaster = inject(ToasterService);

  lockForm: FormGroup;
  isSubmitting = signal<boolean>(false);

  constructor() {
    addIcons({ lockClosedOutline, lockOpenOutline, logOutOutline });
    this.lockForm = this.fb.group({
      password: ['', [Validators.required]]
    });
  }

  unlock() {
    if (this.lockForm.valid) {
      const { password } = this.lockForm.value;
      const success = this.localLockService.unlock(password);

      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.toaster.presentToast({
          message: 'Password incorretta',
          position: 'bottom'
        }, 'danger');
      }
    }
  }

  async logout() {
    try {
      this.localLockService.clearLock();
      await this.usersService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  }
}
