import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonInputPasswordToggle } from '@ionic/angular/standalone';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Auth, authState, signInAnonymously, signOut, User, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ToasterService } from 'src/app/shared/services/toaster.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonInput,
    IonLabel,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonLabel,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    IonInputPasswordToggle
  ]
})
export class LoginPage implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private $toaster = inject(ToasterService);


  email= signal<string>('');
password= signal<string>('');
formValue= computed(() => {
  const out = {
    email: this.email(),
    password: this.password()
  }
  return out
})
isFormValid= computed(() => {
  return this.formValue() && this.formValue()?.email && this.formValue()?.password
})

onPasswordChange($event: any) {
if($event.target){
console.log("password",$event.target?.value)
this.password.set($event.target?.value)
}
}
onEmailChange($event: any) {
if($event.target){
console.log("email",$event.target?.value)
this.email.set($event.target?.value)
}
}
loginForm: FormGroup

  error: boolean= false;
  errorMessage: any;
  afAuth: AngularFireAuth;
  constructor() {
    this.afAuth = inject(AngularFireAuth);
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    }); }

  ngOnInit() {
console.log("init login page")
  }
  login() {
    if (this.loginForm.valid) {
    console.log( this.email,this.password);
      console.log('Login form submitted:', this.loginForm.value);

    this.afAuth
      .signInWithEmailAndPassword(this.email(), this.password())
      .catch((error: { message: any; }) => {
        console.log(error.message);
        this.$toaster.presentToast({message: String(error.message), position: "bottom"});
        this.error = true;
        this.errorMessage = error.message;
        this.cdr.detectChanges();
      })
      .then((data: any) => {
        console.log("data",data)
        if (data) {
          this.error = false;
          this.errorMessage = '';
          
          console.log("login successfull");
          // Reindirizza alla dashboard
          this.router.navigate(['/dashboard']);

        } else {
          console.log('login failed');
          this.$toaster.presentToast({message: 'Login failed', position: "top"});
        }
      });
    } else {
      console.log('Login form is invalid');
      this.$toaster.presentToast({message: 'Login form is invalid', position: "top"});
    }
  }

}
