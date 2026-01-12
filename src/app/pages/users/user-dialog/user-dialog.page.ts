import { Component, OnInit, Input, signal, effect, ViewChild } from '@angular/core';
import { ModalController, IonBackButton, IonContent, IonHeader, IonIcon, IonTabs, IonTabBar, IonTabButton, IonTitle, IonToolbar, IonTab, IonLabel, IonGrid, IonRow, IonCol, IonItemDivider, IonList, IonItem, IonInput, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentModel } from 'src/app/pages/classes/models/documentModel';
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
import { documentTextOutline, personOutline, sparklesOutline, trash, add } from 'ionicons/icons';
import { AlertController } from '@ionic/angular/standalone';

/**
 * Pagina di dialogo principale per la gestione di un utente.
 * Integra i componenti per generalità, note riservate e valutazioni in tab separati.
 */
@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.page.html',
  styleUrls: ['./user-dialog.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonBackButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonTab,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonItemDivider,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    UserGeneralities2Component,
    ReservedNotes4studentComponent,
    Evaluation4StudentComponent
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

  // PDP Links Management
  pdpList = signal<DocumentModel[]>([]);
  initialPdpList: string = '[]';

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
    private readonly modalCtrl: ModalController,
    private readonly alertCtrl: AlertController
  ) {
    console.log("UserDialogPage constructor");
    addIcons({
      'document-text': documentTextOutline,
      'person': personOutline,
      'sparkles': sparklesOutline,
      'trash': trash,
      'add': add
    });

    // Inizializzazione nel constructor


    effect(() => {
      this.usersClasses.set(this.user().assignedClasses);
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
        const user = await this.$users.fetchUserOnCache(userKey);
        if (user) {
          console.log("user showed", user);
          if (user instanceof UserModel) {
            this.user.set(user);
            // Initialize PDP list
            if (user.pdpUrl && Array.isArray(user.pdpUrl)) {
              this.pdpList.set(JSON.parse(JSON.stringify(user.pdpUrl)));
            } else {
              this.pdpList.set([]);
            }
            this.initialPdpList = JSON.stringify(this.pdpList());
          }
        }

      } catch (error) {
        console.error("Errore nel caricamento dell'utente:", error);
      }
    } else {
      console.log("nuovo studente")
    }

    // Inizializza le classi
    this.$classes.getClassiOnRealtime()
      .subscribe((classi) => {
        this.elencoClassi.set(classi);
      });

    // Inizializza i ruoli
    const rolesKey = Object.keys(UsersRole);
    this.rolesValue = Object.values(UsersRole).slice(rolesKey.length / 2);
  }

  addPdp() {
    this.pdpList.update(list => [...list, new DocumentModel()]);
  }

  removePdp(index: number) {
    this.pdpList.update(list => list.filter((_, i) => i !== index));
  }

  hasUnsavedChanges(): boolean {
    const pdpChanged = JSON.stringify(this.pdpList()) !== this.initialPdpList;
    return this.userForm.dirty || pdpChanged;
  }

  async dismiss() {
    if (this.hasUnsavedChanges()) {
      const alert = await this.alertCtrl.create({
        header: 'Modifiche non salvate',
        message: 'Hai delle modifiche non salvate. Sei sicuro di voler uscire? Le modifiche andranno perse.',
        buttons: [
          {
            text: 'Annulla',
            role: 'cancel'
          },
          {
            text: 'Esci senza salvare',
            role: 'destructive',
            handler: () => {
              this.modalCtrl.dismiss();
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.modalCtrl.dismiss();
    }
  }

  save() {
    const user = this.user();
    user.key = this.user()?.key;
    user.pdpUrl = this.pdpList(); // Save PDP links

    const claims = {
      role: user.role,
      classes: user.classes,
      classKey: user.classe
    };
    if (user.key) {
      this.$users.updateUser(user.key, user).then(() => {
        console.log("user updated");
        this.toaster.presentToast({ message: "User aggiornato con successo", duration: 2000, position: "bottom" });
      }).catch((error: any) => {
        console.log("error updating user", error);
        this.toaster.presentToast({ message: "Errore durante l'aggiornamento del user", duration: 2000, position: "bottom" });
      });

      this.$users.setUserClaims2user(user.key, claims).then(async (data: any) => {
        const usersClaims = await this.$users.getCustomClaims4LoggedUser();
        this.toaster.presentToast({ message: "Claims aggiornati con successo", duration: 2000, position: "bottom" });
      }).catch((error: any) => {
        this.toaster.presentToast({ message: "Errore durante l'aggiornamento dei claims", duration: 2000, position: "bottom" });
      });
    }
    else {
      this.$users.createUser(user).then(() => {
        console.log("user created");
        this.toaster.presentToast({ message: "Utente creato con successo", duration: 2000, position: "bottom" });
        this.modalCtrl.dismiss();
      }).catch((error: any) => {
        console.log("error creating user", error);
        this.toaster.presentToast({ message: "Errore durante la creazione dell'utente", duration: 2000, position: "bottom" });
      });
    }

  }
}
