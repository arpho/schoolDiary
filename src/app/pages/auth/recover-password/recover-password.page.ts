import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../../shared/services/users.service';
import { ToasterService } from '../../../shared/services/toaster.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.page.html',
  styleUrls: ['./recover-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule
  ]
})
export class RecoverPasswordPage implements OnInit {
  recoverForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private toaster: ToasterService
  ) {
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
  }

  async onSubmit() {
    if (this.recoverForm.valid) {
      const email = this.recoverForm.get('email')?.value;
      try {
        const success = await this.usersService.sendPasswordRecoverEmail(email);
        if (success) {
          this.toaster.showToast({
            message: 'Email di recupero inviata con successo! Controlla la tua casella di posta.',
            duration: 3000,
            position: 'bottom'
          });
          this.recoverForm.reset();
        } else {
          this.toaster.showToast({
            message: "Errore durante l'invio dell'email di recupero.",
            duration: 3000,
            position: 'bottom'
          });
        }
      } catch (error) {
        this.toaster.showToast({
          message: 'Si è verificato un errore. Riprova più tardi.',
          duration: 3000,
          position: 'bottom'
        });
      }
    }
  }

}
