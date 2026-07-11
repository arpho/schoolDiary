import { Component, computed, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';

import { form, schema, required, email, minLength, FormField, FormRoot } from '@angular/forms/signals';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    RouterModule,
    IonLabel,
    IonButton,
    IonItem,
    IonInput,
    IonList,
    IonCard,
    IonCardContent,
    IonIcon,
    IonText,
    IonInputPasswordToggle,
    FormField,
    FormRoot
]
})
export class SignupPage {
  private service = inject(UsersService);
  private toaster = inject(ToasterService);

  signupModel = signal({
    email: '',
    password: '',
    name: '',
    surname: '',
    passwordConfirm: ''
  });

  signupForm = form(this.signupModel, schema((s) => {
    required(s.email);
    email(s.email);
    required(s.password);
    minLength(s.password, 8);
    required(s.name);
    required(s.surname);
    required(s.passwordConfirm);
  }));

  constructor() {
    addIcons({ personOutline, mailOutline, lockClosedOutline, personAddOutline });
  }

  isFormValid = computed(() => {
    return this.signupForm().valid() && this.signupForm().value().password === this.signupForm().value().passwordConfirm;
  });

  signup() {
    if (this.isFormValid()) {
      const { name, surname, email, password, passwordConfirm } = this.signupForm().value();

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
