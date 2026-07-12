import { ChangeDetectorRef, Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';

import { form, schema, required, email, minLength, FormField, FormRoot } from '@angular/forms/signals';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton, IonInputPasswordToggle, IonCard, IonCardContent, IonIcon, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logInOutline, personAddOutline, helpCircleOutline } from 'ionicons/icons';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router, RouterModule } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { LocalLockService } from 'src/app/shared/services/local-lock.service';

/**
 * Pagina di login.
 * Gestisce l'autenticazione tramite email e password utilizzando Firebase Auth.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    IonButton,
    IonInput,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    RouterModule,
    IonInputPasswordToggle,
    IonCard,
    IonCardContent,
    IonIcon,
    IonText,
    FormField,
    FormRoot
]
})
export class LoginPage implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private $toaster = inject(ToasterService);
  private localLockService = inject(LocalLockService);
  public afAuth = inject(AngularFireAuth);

  loginModel = signal({ email: '', password: '' });
  
  loginForm = form(this.loginModel, schema((s) => {
    required(s.email);
    email(s.email);
    required(s.password);
    minLength(s.password, 8);
  }));

  error: boolean = false;
  errorMessage: any;

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, logInOutline, personAddOutline, helpCircleOutline });
  }

  ngOnInit() {
    console.log("init login page")
  }

  login() {
    console.log('Form valid:', this.loginForm().valid());
    console.log('Model values:', this.loginModel());
    console.log('Form values:', this.loginForm().value());

    const { email, password } = this.loginModel();
    
    if (!email || !password || password.length < 8) {
      console.log('Login form is invalid manually');
      this.$toaster.presentToast({ message: 'Credenziali non valide (password min 8)', position: "top" });
      return;
    }

    console.log('Login submitting with:', { email });

    this.afAuth
      .signInWithEmailAndPassword(email, password)
      .catch((error: { message: any; }) => {
        console.log(error.message);
        this.$toaster.presentToast({ message: String(error.message), position: "bottom" });
        this.error = true;
        this.errorMessage = error.message;
        this.cdr.detectChanges();
      })
      .then((data: any) => {
        console.log("data", data)
        if (data) {
          this.error = false;
          this.errorMessage = '';

          console.log("login successfull");
          
          // Set up local lock with the used password
          this.localLockService.setupPassword(password);
          
          // Reindirizza alla dashboard
          this.router.navigate(['/dashboard']);

        } else {
          console.log('login failed');
          this.$toaster.presentToast({ message: 'Login failed', position: "top" });
        }
      });
  }

}
