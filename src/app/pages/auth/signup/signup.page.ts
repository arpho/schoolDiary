import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonList, IonCard, IonCardContent, IonIcon, IonText, IonInputPasswordToggle } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { addIcons } from 'ionicons';
import { personOutline, mailOutline, lockClosedOutline, personAddOutline } from 'ionicons/icons';

/**
 * Pagina di registrazione utente.
 * Gestisce la creazione di un nuovo account utente con email, password e dati anagrafici.
 */
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonLabel,
    IonButton,
    IonItem,
    RouterModule,
    IonInput,
    IonList,
    IonCard,
    IonCardContent,
    IonIcon,
    IonText,
    IonInputPasswordToggle
  ]
})
export class SignupPage {
  private fb = inject(FormBuilder);
  private service = inject(UsersService);
  private toaster = inject(ToasterService);

  signupForm: FormGroup;

  constructor() {
    addIcons({ personOutline, mailOutline, lockClosedOutline, personAddOutline });
    this.signupForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      name: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      passwordConfirm: new FormControl('', [Validators.required]),
    });
  }

  isFormValid = computed(() => {
    return this.signupForm.valid && this.signupForm.get('password')?.value === this.signupForm.get('passwordConfirm')?.value;
  });

  signup() {
    if (this.signupForm.valid) {
      const { name, surname, email, password, passwordConfirm } = this.signupForm.value;

      if (password !== passwordConfirm) {
        this.toaster.presentToast({ message: 'Passwords do not match', position: 'top' });
        return;
      }

      const formValueForModel = {
        firstName: name,
        lastName: surname,
        email: email,
        password: password
      };

      console.log('Signup form submitted:', formValueForModel);
      const user = new UserModel(formValueForModel);
      console.log("creating user", user);

      this.service.signupUser(user).then(() => {
        this.toaster.presentToast({ message: 'User created successfully', position: 'top' });
      }).catch((error) => {
        this.toaster.presentToast({ message: String(error.message), position: 'top' });
      });
    } else {
      console.log('Signup form is invalid');
      this.toaster.presentToast({ message: 'Please fill all required fields correctly', position: 'top' });
    }
  }
}
