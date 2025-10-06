import { Component, OnInit, Input, signal, effect } from '@angular/core';
import { ModalController, IonBackButton, IonContent, IonHeader, IonIcon, IonTabs, IonTabBar, IonTabButton, IonTitle, IonToolbar, IonTab, IonLabel } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserGeneralitiesComponent } from '../components/user-generalities/user-generalities.component';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { UserModel } from 'src/app/shared/models/userModel';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { ClassiService } from '../../classes/services/classi.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservedNotes4studentComponent } from "../components/reserved-notes4student/reserved-notes4student.component";
import { Evaluation4StudentComponent } from "../components/evaluation4-student/evaluation4-student.component";

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.page.html',
  styleUrls: ['./user-dialog.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonBackButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    UserGeneralitiesComponent,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonTab,
    ReservedNotes4studentComponent,
    IonLabel,
    Evaluation4StudentComponent
]
})
export class UserDialogPage implements OnInit {
  nomeStudente() {
return this.user()?.lastName + " " + this.user()?.firstName;
}
  editedUser($event: UserModel) {
    console.log("editedUser*", $event);
    this.user.set($event);
    console.log("userSignal*", this.user());
  }

  // Variabili di stato
  userKey: string = ""
  user = signal<UserModel>(new UserModel({ role: UsersRole.STUDENT }));
  
  @Input() 
  set classKey(value: string | null) {
    if (value) {
      this._updateUserClass(value);
    }
  }
  
  get classKey(): string | null {
    return this.user()?.classKey || null;
  }
  
  // Metodo privato per aggiornare la classe dell'utente
  private _updateUserClass(classKeyValue: string) {
    const currentUser = this.user();
    if (currentUser) {
      // Crea un nuovo array di classi senza duplicati
      const updatedClasses = Array.from(new Set([
        ...(currentUser.classes || []).filter(c => c !== classKeyValue), // Rimuovi il valore se già presente
        classKeyValue
      ]));
      
      const updatedUser = new UserModel({
        ...currentUser,
        classes: updatedClasses,
        classKey: classKeyValue  // Sovrascrivi classKey invece di aggiungerlo
      });
      this.user.set(updatedUser);
    }
  }
  usersClasses = signal<ClasseModel[]>([]);
  elencoClassi = signal<ClasseModel[]>([]);
  loggedUser = signal<UserModel>(new UserModel({ role: UsersRole.STUDENT }));
  rolesValue: any[] = [];
  rolesName: string[] = [];
  userForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(1)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(1)]),
    userName: new FormControl('', [Validators.required, Validators.minLength(1)]),
    email: new FormControl('', [Validators.email]),
    role: new FormControl(UsersRole.STUDENT),
    phoneNumber: new FormControl(''),
    birthDate: new FormControl(''),
    classes: new FormControl([]),
    classe: new FormControl('')
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly $users: UsersService,
    private readonly $classes: ClassiService,
    private readonly toaster: ToasterService,
    private readonly router: Router,
    private readonly modalCtrl: ModalController
  ) {
    console.log("UserDialogPage constructor");
    
    // Inizializzazione nel constructor

    // Aggiungi gli effetti
    effect(() => {
      console.log("userSignal updated", this.user());
    });

    effect(() => {
      console.log("setting classi", this.user().classi);
      this.usersClasses.set(this.user().classi);
    });
  }

  // Metodo del ciclo di vita di Ionic
  async ionViewWillEnter() {
    const modal = await this.modalCtrl.getTop();
    const classKey = modal?.componentProps?.['classKey'];
    if (classKey) {
      console.log("classKey from modal props:", classKey);
      this._updateUserClass(classKey);
    }
  }

  async ngOnInit() {
    const loggedUser = await this.$users.getLoggedUser();
    if (loggedUser) {
      this.loggedUser.set(loggedUser);
    }
    const userKey = this.route.snapshot.paramMap.get('userKey');
    console.log("UserDialogPage ngOnInit, userKey:", userKey, "classKey:", this.classKey);
    
    // Imposta la userKey nella proprietà del componente
    if (userKey) {
      this.userKey = userKey;
    }
    
    // Se classKey è presente, imposta la classe predefinita
    const classKeyValue = this.classKey;
    if (classKeyValue) {
      console.log("current class from input", classKeyValue);
      this._updateUserClass(classKeyValue);
    }
    
    // Se userKey esiste, carica l'utente
    if (userKey) {
      console.log("editing user", userKey);
      try {
        const user = this.$users.fetchUserOnCache(userKey);
        if (user) {
          this.user.set(user);
          console.log("Utente caricato:", user);
        }
      
      } catch (error) {
        console.error("Errore nel caricamento dell'utente:", error);
      }
    }  else{
      console.log("nuovo studente")
    }

    // Inizializza le classi
    this.$classes.getClassiOnRealtime((classi) => {
      this.elencoClassi.set(classi);
    });

    // Inizializza i ruoli
    const rolesKey = Object.keys(UsersRole);
    this.rolesValue = Object.values(UsersRole).slice(rolesKey.length/2);
  }

  save() {
    console.log("save", this.user());
    console.log("clases on user from userSignal", this.user()?.classes);
    const user = this.user();
    user.key = this.user()?.key;
    console.log("userSignal", this.user());
    const claims = {
      role: user.role,
      classes: user.classes,
      classKey: user.classe
    };
    console.log("claims", claims);
    if(user.key){
    this.$users.updateUser(user.key, user).then(() => {
      console.log("user updated");
      this.toaster.presentToast({message: "User aggiornato con successo", duration: 2000, position: "bottom"});
    }).catch((error: any) => {
      console.log("error updating user", error);
      this.toaster.presentToast({message: "Errore durante l'aggiornamento del user", duration: 2000, position: "bottom"});
    });

    this.$users.setUserClaims2user(user.key, claims).then(async (data: any) => {
      console.log("claims set", data);
      const usersClaims = await this.$users.getCustomClaims4LoggedUser();
      console.log("usersClaims", usersClaims);
      this.toaster.presentToast({message: "Claims aggiornati con successo", duration: 2000, position: "bottom"});
    }).catch((error: any) => {
      console.log("error setting claims", error);
      this.toaster.presentToast({message: "Errore durante l'aggiornamento dei claims", duration: 2000, position: "bottom"});
    });
  }
  else{
    console.log("user to create", user);
    
}

}
}
