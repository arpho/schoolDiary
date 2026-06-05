import { Component, OnInit, Input, signal, effect, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ModalController,
  IonBackButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonButton,
  IonItem,
  IonButtons
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { StudentAvatarComponent } from '../components/student-avatar/student-avatar.component';
import { StudentDisabilityComponent } from '../components/student-disability/student-disability.component';
import { DisabilityData } from '../components/student-disability/student-disability.component';
import { HasUnsavedChanges } from 'src/app/shared/guards/pending-changes.guard';
import { addIcons } from 'ionicons';
import { personOutline, sparklesOutline, documentTextOutline, menu, close, accessibilityOutline } from 'ionicons/icons';
import { AlertController } from '@ionic/angular/standalone';

type TabType = 'generalita' | 'disabilita' | 'note' | 'valutazioni';

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
    IonLabel,
    IonItem,
    IonButton,
    IonButtons,
    UserGeneralities2Component,
    ReservedNotes4studentComponent,
    Evaluation4StudentComponent,
    StudentAvatarComponent,
    StudentDisabilityComponent
  ]
})
export class UserDialogPage implements OnInit, HasUnsavedChanges {
  @ViewChild(UserGeneralities2Component) generalitiesComp!: UserGeneralities2Component;

  // Gestione sidebar e tab
  selectedTab = signal<TabType>('generalita');
  sidebarOpen = signal<boolean>(false);

  selectTab(tab: TabType) {
    this.selectedTab.set(tab);
    this.sidebarOpen.set(false);
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }
  nomeStudente() {
    return this.user()?.lastName + " " + this.user()?.firstName;
  }

  editedUser($event: any | UserModel) {
    this.user.set(new UserModel($event));
  }

  /** Aggiorna la foto profilo dopo l'upload */
  onPhotoChanged(newUrl: string) {
    const updated = new UserModel({ ...this.user(), photoUrl: newUrl });
    this.user.set(updated);
    if (updated.key) {
      this.$users.updateUser(updated.key, updated)
        .catch(e => console.error('Errore salvataggio photoUrl:', e));
    }
  }

  /** Timer per debounce del salvataggio disabilità */
  private _disabilitySaveTimer: ReturnType<typeof setTimeout> | null = null;

  /** Aggiorna i dati disabilità + PDP quando il sotto-componente emette */
  onDisabilityChanged(data: DisabilityData) {
    const updated = new UserModel({
      ...this.user(),
      DVA:  data.DVA,
      DSA:  data.DSA,
      BES:  data.BES,
      ADHD: data.ADHD,
      noteDisabilita: data.noteDisabilita,
      pdpUrl: data.pdpUrl
    });
    this.user.set(updated);
    // Persistere su Firestore con debounce (evita scritture eccessive durante la digitazione)
    if (updated.key) {
      if (this._disabilitySaveTimer) clearTimeout(this._disabilitySaveTimer);
      this._disabilitySaveTimer = setTimeout(() => {
        this.$users.updateUser(updated.key, updated)
          .then(() => this.toaster.presentToast({ message: 'Dati salvati', duration: 1500, position: 'bottom' }))
          .catch(e => console.error('Errore salvataggio dati disabilità:', e));
      }, 800);
    }
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
  elencoClassi = toSignal(this.$classes.getClassiOnRealtime(), { initialValue: [] });
  loggedUser = signal<UserModel>(new UserModel({ role: UsersRole.STUDENT }));

  rolesValue: any[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly $users: UsersService,
    private readonly $classes: ClassiService,
    private readonly toaster: ToasterService,
    private readonly router: Router,
    private readonly modalCtrl: ModalController,
    private readonly alertCtrl: AlertController
  ) {
    addIcons({
      'person': personOutline,
      'sparkles': sparklesOutline,
      'document-text': documentTextOutline,
      'accessibility-outline': accessibilityOutline,
      'menu': menu,
      'close': close
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
    const loggedUser = await this.$users.getLoggedUser();
    if (loggedUser) {
      this.loggedUser.set(loggedUser);
    }

    const userKey = this.route.snapshot.paramMap.get('userKey');
    if (userKey) {
      this.userKey = userKey;
    }

    const classKeyValue = this.classKey;
    if (classKeyValue) {
      this._updateUserClass(classKeyValue);
    }

    if (userKey) {
      try {
        const user = await this.$users.fetchUserOnCache(userKey);
        if (user instanceof UserModel) {
          this.user.set(user);
        }
      } catch (error) {
        console.error("Errore nel caricamento dell'utente:", error);
      }
    }

    const rolesKey = Object.keys(UsersRole);
    this.rolesValue = Object.values(UsersRole).slice(rolesKey.length / 2);
  }


  hasUnsavedChanges(): boolean {
    return !!(this.generalitiesComp && this.generalitiesComp.hasUnsavedChanges());
  }

  async dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    const user = this.user();
    user.key = this.user()?.key;
    const claims = {
      role: user.role,
      classes: user.classes,
      classKey: user.classe
    };
    if (user.key) {
      this.$users.updateUser(user.key, user)
        .then(() => this.toaster.presentToast({ message: "Utente aggiornato con successo", duration: 2000, position: "bottom" }))
        .catch(() => this.toaster.presentToast({ message: "Errore durante l'aggiornamento", duration: 2000, position: "bottom" }));

      this.$users.setUserClaims2user(user.key, claims)
        .then(() => this.toaster.presentToast({ message: "Autorizzazioni aggiornate", duration: 2000, position: "bottom" }))
        .catch(() => this.toaster.presentToast({ message: "Errore durante l'aggiornamento delle autorizzazioni", duration: 2000, position: "bottom" }));
    } else {
      this.$users.createUser(user)
        .then(() => {
          this.toaster.presentToast({ message: "Utente creato con successo", duration: 2000, position: "bottom" });
          this.modalCtrl.dismiss();
        })
        .catch(() => this.toaster.presentToast({ message: "Errore durante la creazione dell'utente", duration: 2000, position: "bottom" }));
    }
  }
}
