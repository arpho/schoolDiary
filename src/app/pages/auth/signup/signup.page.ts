import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonList } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { ToasterService } from 'src/app/shared/services/toaster.service';
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
         IonList
      
        ]
})
export class SignupPage  {
onNameChange($event: any) {
  if($event.target){
console.log("name",$event.target?.value)
this.name.set($event.target?.value)
}
}
onSurnameChange($event: any) {
console.log("surname",$event.target?.value)
this.surname.set($event.target?.value)
}
onEmailChange($event: any) {
console.log("email",$event.target?.value)
this.email.set($event.target?.value)
}
onPasswordChange($event: any) {
console.log("password",$event.target?.value)
this.password.set($event.target?.value)
}
onPasswordConfirmChange($event: any) {
console.log("passwordConfirm",$event.target?.value)
this.passwordConfirm.set($event.target?.value)
}
  signupForm: FormGroup;
  email= signal<string>('');
  password= signal<string>('');
  name= signal<string>('');
  surname= signal<string>('');
  passwordConfirm= signal<string>('');

  constructor(
    private fb: FormBuilder,
    private service: UsersService,
    private toaster: ToasterService
  ) { 
    this.signupForm=this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      name: new FormControl('', [Validators.required]),
      surname: new FormControl('', [Validators.required]),
      passwordConfirm: new FormControl('', [Validators.required]),
    });

  }
  formErrors= computed(() => {
    const errors: string[] = [];
    if (!this.email()) errors.push('Email is required');
    if (!this.password()) errors.push('Password is required');
    if (!this.name()) errors.push('Name is required');
    if (!this.surname()) errors.push('Surname is required');
    if (!this.passwordConfirm()) errors.push('Password confirm is required');
    if (this.passwordConfirm() !== this.password()) errors.push('Passwords do not match');
    return errors;
  })
  isFormValid= computed(() => {
    return this.email() && this.password() && this.name() && this.surname() && this.passwordConfirm() && this.passwordConfirm() === this.password()
  })
formValue= computed(() => {
  const out ={
    firstName: this.name(),
    lastName: this.surname(),
    email: this.email(),
    password: this.password(),
    passwordConfirm: this.passwordConfirm()
  }
  return out
})
  signup() {

    if (this.isFormValid()) {
      console.log('Signup form submitted:', this.formValue());
      const user = new UserModel(this.formValue());
      console.log("creating user",user)
      this.service.signupUser(user).then(() => {
        this.toaster.presentToast({message: 'User created successfully', position: 'top'});
      }).catch((error) => {
        this.toaster.presentToast({message: String(error.message), position: 'top'});
      });
    } else {
      console.log('Signup form is invalid');
    }
  }



}
