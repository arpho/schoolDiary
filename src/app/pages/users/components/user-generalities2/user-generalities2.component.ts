import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, effect, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { addIcons } from 'ionicons';
import {
  saveOutline, documentTextOutline, trash, add,
  copyOutline, openOutline, schoolOutline, accessibilityOutline,
  personOutline
} from 'ionicons/icons';
import { DocumentModel } from 'src/app/pages/classes/models/documentModel';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonFooter,
  IonFabButton,
  IonIcon,
  IonNote,
  IonFab,
  IonTextarea,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonList
} from '@ionic/angular/standalone';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { IonTextareaCustomEvent } from '@ionic/core';
import { ClassesFieldComponent } from 'src/app/pages/classes/components/classes-field/classes-field.component';
import { TextareaChangeEventDetail } from "@ionic/angular";
import { AssignedClass } from 'src/app/pages/subjects-list/models/assignedClass';
/**
 * Componente per la gestione delle generalità di un utente.
 * Gestisce dati anagrafici, ruolo, disabilità, PDP e assegnazione classi.
 */
@Component({
  selector: 'app-user-generalities2',
  templateUrl: './user-generalities2.component.html',
  styleUrls: ['./user-generalities2.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonIcon,
    IonLabel,
    IonItem,
    IonSelectOption,
    IonNote,
    ClassesFieldComponent,
    IonFooter,
    IonFab,
    IonFabButton,
    IonTextarea,
    IonInput,
    IonSelect,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonList
  ]
})
export class UserGeneralities2Component implements OnInit {
  user = input.required<UserModel>();
  userForm: FormGroup

  rolesValue: any[] = [];
  rolesName: string[] = [];
  elencoClassi = signal<ClasseModel[]>([]);

  usersClasses = signal<AssignedClass[]>([]);
  $UsersRole = UsersRole;



  /** Lista locale dei documenti PDP per lo studente */
  pdpList = signal<DocumentModel[]>([]);
  constructor(
    private $users: UsersService,
    private $classes: ClassiService,
    private toaster: ToasterService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      'save': saveOutline,
      'pdf': documentTextOutline,
      'trash': trash,
      'add': add,
      'copy-outline': copyOutline,
      'open-outline': openOutline,
      'school-outline': schoolOutline,
      'accessibility-outline': accessibilityOutline,
      'person-outline': personOutline,
      'document-text-outline': documentTextOutline
    });


    // Inizializza la form
    this.userForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      userName: [''],
      email: [''],
      role: [UsersRole.STUDENT],
      DVA: [false],
      DSA: [false],
      BES: [false],
      ADHD: [false],
      noteDisabilita: [''],
      pdpUrl: [''],
      phoneNumber: [''],
      birthDate: [''],
      classKey: [''],
      classes: [[]]
    });

    effect(() => {
      const user = this.user();
      console.log('User in effect:*', user);
      if (user.key) {
        console.log('Syncing form with user:*', user);
        this.syncFormWithUser(user);
      } else {
        console.warn('User is null or undefined*');
      }
    }, { allowSignalWrites: true });
  }

  onClassesChange(classes: AssignedClass[]) {
    console.log("onClassesChange - classes:", classes);
    this.usersClasses.set(classes);
    this.userForm.get('classes')?.setValue(classes.map(c => c.key));
  }

  onNoteDisabilitaChange($event: IonTextareaCustomEvent<TextareaChangeEventDetail>) {
    console.log("Note disabilità changed:", $event.detail.value);

    const value = $event.detail.value;
    this.userForm.get('noteDisabilita')?.setValue(value);
    this.userForm.updateValueAndValidity();
  }

  private readonly userEffect = effect(async () => {
    const loggedUser = await this.$users.getLoggedUser();
    const user = this.user();
    if (loggedUser) {
      this.elencoClassi.set(loggedUser.assignedClasses)
    }
    this.usersClasses.set(this.elencoClassi().map(c => new AssignedClass(c)))
    if (user.key) {
      if (user.classesKey) {
        const classPromises = user.classesKey.map((classKey: string) => this.$classes.fetchClasseOnCache(classKey));
        await Promise.all(classPromises);
      }
      this.syncFormWithUser(user);
    }
  });
  ngOnInit() {
    this.cdr.detectChanges();
    const rolesKey = Object.keys(UsersRole);
    this.rolesValue = Object.values(UsersRole).slice(rolesKey.length / 2);
    this.userForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      userName: [''],
      email: [''],
      role: [UsersRole.STUDENT],
      DVA: [false],
      DSA: [false],
      BES: [false],
      ADHD: [false],
      noteDisabilita: [''],
      pdpUrl: [''],
      phoneNumber: [''],
      birthDate: [''],
      classKey: [''],
      classes: [[]]
    });
  }
  ngAfterViewInit() {
    setTimeout(() => this.cdr.detectChanges());
  }
  generatePassword(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
  }

  save() {
    const formValue = this.userForm.value;
    // Escludiamo pdpUrl dal formValue: il campo del form è una stringa ausiliaria,
    // mentre il vero pdpUrl è un DocumentModel[] gestito separatamente tramite pdpList signal.
    const { pdpUrl: _ignoredPdpUrl, ...formValueWithoutPdp } = formValue;
    const userData = {
      ...this.user(),
      ...formValueWithoutPdp,
      pdpUrl: this.pdpList(),
      assignedClasses: this.usersClasses()
    };
    const user = new UserModel(userData);
    const claims = {
      role: user.role,
      classes: user.classes,
      classKey: user.classe,
    };
    if (user.key) {
      this.updateUser(user, claims);
    } else {
      user.password = this.generatePassword();
      this.createUser(user, claims);
    }
  }

  /** Attiva/disattiva un chip di disabilità */
  toggleChip(field: 'DVA' | 'DSA' | 'BES' | 'ADHD'): void {
    const current = this.userForm.get(field)?.value;
    this.userForm.get(field)?.setValue(!current);
    this.userForm.get(field)?.markAsDirty();
  }

  /** Aggiunge un documento PDP vuoto alla lista */
  addPdp(): void {
    this.pdpList.update(list => [...list, new DocumentModel()]);
  }

  /** Rimuove il documento PDP all'indice specificato */
  removePdp(index: number): void {
    this.pdpList.update(list => list.filter((_, i) => i !== index));
  }

  /** Apre il link in una nuova scheda */
  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  /** Copia il link negli appunti */
  copyLink(url: string): void {
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        this.toaster.presentToast({
          message: 'Link copiato negli appunti',
          duration: 1500,
          position: 'bottom'
        });
      }).catch(() => {
        this.toaster.presentToast({
          message: 'Impossibile copiare il link',
          duration: 1500,
          position: 'bottom'
        });
      });
    }
  }

  private updateUser(user: UserModel, claims: any) {
    this.$users.updateUser(user.key, user)
      .then(() => {
        this.toaster.presentToast({
          message: "Utente aggiornato con successo",
          duration: 2000,
          position: "bottom"
        });
        return this.updateUserClaims(user.key, claims);
      })
      .catch(error => {
        console.error("Errore aggiornamento utente:", error);
        this.toaster.presentToast({
          message: "Errore durante l'aggiornamento dell'utente",
          duration: 2000,
          position: "bottom"
        });
      });
  }

  private createUser(user: UserModel, claims: any) {
    this.$users.createUser(user)
      .then((data: any) => {
        console.log("User created successfully:", data);
        this.toaster.presentToast({
          message: "Utente creato con successo",
          duration: 2000,
          position: "bottom"
        });
        return this.updateUserClaims(user.key, claims);
      })
      .catch(error => {
        console.error("Error creating user:", error);
        this.toaster.presentToast({
          message: "Errore durante la creazione dell'utente",
          duration: 2000,
          position: "bottom"
        });
      });
  }

  private updateUserClaims(userId: string, claims: any) {
    return this.$users.setUserClaims2user(userId, claims)
      .then(async (data: any) => {
        console.log("Claims set successfully:", data);
        const usersClaims = await this.$users.getCustomClaims4LoggedUser();
        console.log("Current user claims:", usersClaims);
        this.toaster.presentToast({
          message: "Autorizzazioni aggiornate con successo",
          duration: 2000,
          position: "bottom"
        });
      })
      .catch(error => {
        console.error("Error setting claims:", error);
        this.toaster.presentToast({
          message: "Errore durante l'aggiornamento delle autorizzazioni",
          duration: 2000,
          position: "bottom"
        });
      });
  }



  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);

    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return 'Campo obbligatorio';
    }

    if (control.hasError('email')) {
      return 'Inserisci un indirizzo email valido';
    }

    if (control.hasError('minlength')) {
      return `Minimo ${control.getError('minlength').requiredLength} caratteri richiesti`;
    }

    return 'Campo non valido';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  /** Logga lo stato del form (rimosso per produzione) */
  private logFormState(): void { /* no-op */ }
  syncFormWithUser(user: UserModel) {
    if (!this.userForm) return;
    if (user.key) {
      try {
        this.userForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          userName: user.userName || '',
          email: user.email || '',
          role: user.role || UsersRole.STUDENT,
          DVA: user.DVA || false,
          DSA: user.DSA || false,
          BES: user.BES || false,
          ADHD: user.ADHD || false,
          noteDisabilita: user.noteDisabilita || '',
          pdpUrl: '',
          phoneNumber: user.phoneNumber || '',
          birthDate: user.birthDate || '',
          classKey: user.classKey || '',
          classes: user.classesKey || []
        }, { emitEvent: false });

        if (user.pdpUrl && Array.isArray(user.pdpUrl)) {
          this.pdpList.set(user.pdpUrl.map(doc => new DocumentModel({ ...doc })));
        } else {
          this.pdpList.set([]);
        }

        this.usersClasses.set(user.assignedClasses || []);
        this.cdr.detectChanges();
        this.userForm.updateValueAndValidity();
      } catch (error) {
        console.error("Errore sincronizzazione form:", error);
      }
    }
  }

  /**
   * Verifica se ci sono modifiche non salvate nel form.
   */
  hasUnsavedChanges(): boolean {
    return this.userForm.dirty;
  }
}
