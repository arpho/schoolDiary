import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonButtons, IonBackButton, CommonModule, FormsModule]
})
export class ResetPasswordPage implements OnInit {
  oldPassword: string = '';
  newPassword: string = '';
  retypePassword: string = '';

  constructor(private router: Router) { }

  ngOnInit() {
  }

  get formValid(): boolean {
    return !!this.oldPassword && !!this.newPassword && !!this.retypePassword && 
           this.newPassword === this.retypePassword;
  }

  onSubmit(): void {
    if (this.formValid) {
      // TODO: Implement password reset logic
      console.log('Password reset submitted');
      this.router.navigate(['/dashboard']);
    }
  }
}
