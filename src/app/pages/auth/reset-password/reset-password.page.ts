import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Auth, reauthenticateWithCredential, EmailAuthProvider } from '@angular/fire/auth';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { UsersService } from 'src/app/shared/services/users.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ResetPasswordPage implements OnInit {
  resetPasswordForm!: FormGroup;
  private auth = inject(Auth);

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private $toaster: ToasterService,
    private $users: UsersService
  ) { }

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.resetPasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required, this.validateOldPassword.bind(this)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      retypePassword: ['', Validators.required]
    }, {
      validators: this.matchPassword
    });
  }

  private validateOldPassword(control: FormControl): Promise<{ [key: string]: any } | null> {
    return new Promise((resolve) => {
      const user = this.auth.currentUser;

      if (!user || !control.value) {
        resolve(null);
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email!,
        control.value
      );

      reauthenticateWithCredential(user, credential)
        .then(() => {
          resolve(null);
        })
        .catch(() => {
          resolve({ invalidOldPassword: true });
        });
    });
  }

  private matchPassword(control: FormGroup): { mismatch: boolean } | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('retypePassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { mismatch: true };
  }

  get formControls() {
    return this.resetPasswordForm.controls;
  }


  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const user = this.auth.currentUser;

      if (user) {
        this.$users.updatePassword(user, this.resetPasswordForm.get('newPassword')?.value)
          .then(() => {
            console.log('Password updated successfully');
            this.router.navigate(['/dashboard']);
          })
          .catch((error: Error) => {
            console.error('Error updating password:', error);
          });
      }
    }
  }
}
