import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';

import { form, schema, required, minLength, FormField, FormRoot } from '@angular/forms/signals';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Auth, reauthenticateWithCredential, EmailAuthProvider } from '@angular/fire/auth';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { UsersService } from 'src/app/shared/services/users.service';

/**
 * Pagina per il reset della password (cambio password da loggato o post-recovery?).
 * Permette di impostare una nuova password confermando quella vecchia o semplicemente impostandone una nuova.
 */
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    IonBackButton,
    FormField,
    FormRoot
]
})
export class ResetPasswordPage implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private $toaster = inject(ToasterService);
  private $users = inject(UsersService);

  resetPasswordModel = signal({
    oldPassword: '',
    newPassword: '',
    retypePassword: ''
  });

  resetPasswordForm = form(this.resetPasswordModel, schema((s) => {
    required(s.oldPassword);
    required(s.newPassword);
    minLength(s.newPassword, 6);
    required(s.retypePassword);
  }));

  invalidOldPassword = signal(false);

  isFormValid = computed(() => {
    const vals = this.resetPasswordForm().value();
    return this.resetPasswordForm().valid() && vals.newPassword === vals.retypePassword;
  });

  constructor() { }

  ngOnInit() {
  }

  async onSubmit(): Promise<void> {
    this.invalidOldPassword.set(false);

    if (!this.isFormValid()) {
      return;
    }

    const { oldPassword, newPassword } = this.resetPasswordForm().value();
    const user = this.auth.currentUser;

    if (!user) {
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email!, oldPassword);
      await reauthenticateWithCredential(user, credential);
    } catch {
      this.invalidOldPassword.set(true);
      return;
    }

    this.$users.updatePassword(user, newPassword)
      .then(() => {
        console.log('Password updated successfully');
        this.router.navigate(['/dashboard']);
      })
      .catch((error: Error) => {
        console.error('Error updating password:', error);
      });
  }
}
