import { Component, OnInit, Input, signal, effect, ViewChild } from '@angular/core';
import { ModalController, IonBackButton, IonContent, IonHeader, IonIcon, IonTabs, IonTabBar, IonTabButton, IonTitle, IonToolbar, IonTab, IonLabel } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { UserGeneralities2Component } from '../components/user-generalities2/user-generalities2.component';
import { addIcons } from 'ionicons';
import { documentTextOutline, personOutline, sparklesOutline } from 'ionicons/icons';

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
    UserGeneralities2Component,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonTab,
    ReservedNotes4studentComponent,
    IonLabel,
    Evaluation4StudentComponent,
    ReactiveFormsModule,
    FormsModule
]
})
export class UserDialogPage implements OnInit {
  @ViewChild('tabs') tabs!: IonTabs;
  
  // Gestione tab attivo
  selectedTab: string = 'generalita';
  


  // Handle tab changes
  setSelectedTab(tab: any) {
    if (tab) {
      this.selectedTab = tab;
    }
  }
  nomeStudente() {
return this.user()?.lastName + " " + this.user()?.firstName;
}
  editedUser($event: any | UserModel) {
    console.log("editedUser*", $event);
    this.user.set(new UserModel($event));
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
    addIcons({
      'document-text': documentTextOutline,
      'person': personOutline,
      'sparkles': sparklesOutline,
    });
    
    // Inizializzazione nel constructor


    effect(() => {
      this.usersClasses.set(this.user().classi);
    });
  }

  // Metodo del ciclo di vita di Ionic
  async ionViewWillEnter() {
    const modal = await this.modalCtrl.getTop();
    const classKey = modal?.componentProps?.['classKey'];
    if (classKey) {
      this._updateUserClass(classKey);
    }
  }

  async ngOnInit() {
    console.log("UserDialogPage ngOnInit");
    const loggedUser = await this.$users.getLoggedUser();
    if (loggedUser) {
      this.loggedUser.set(loggedUser);
    }
    const userKey = this.route.snapshot.paramMap.get('userKey');
    console.log("userKey", userKey);
    
    // Imposta la userKey nella proprietà del componente
    if (userKey) {
      this.userKey = userKey;
    }
    
    // Se classKey è presente, imposta la classe predefinita
    const classKeyValue = this.classKey;
    if (classKeyValue) {
      this._updateUserClass(classKeyValue);
    }
    
    // Se userKey esiste, carica l'utente
    if (userKey) {
      try {
        const user = this.$users.fetchUserOnCache(userKey);
        if (user) {
          console.log("user showed", user);
          this.user.set(user);
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
    const user = this.user();
    user.key = this.user()?.key;
    const claims = {
      role: user.role,
      classes: user.classes,
      classKey: user.classe
    };
    if(user.key){
    this.$users.updateUser(user.key, user).then(() => {
      console.log("user updated");
      this.toaster.presentToast({message: "User aggiornato con successo", duration: 2000, position: "bottom"});
    }).catch((error: any) => {
      console.log("error updating user", error);
      this.toaster.presentToast({message: "Errore durante l'aggiornamento del user", duration: 2000, position: "bottom"});
    });

    this.$users.setUserClaims2user(user.key, claims).then(async (data: any) => {
      const usersClaims = await this.$users.getCustomClaims4LoggedUser();
      this.toaster.presentToast({message: "Claims aggiornati con successo", duration: 2000, position: "bottom"});
    }).catch((error: any) => {
      this.toaster.presentToast({message: "Errore durante l'aggiornamento dei claims", duration: 2000, position: "bottom"});
    });
  }
  else{
    
}

}
}
