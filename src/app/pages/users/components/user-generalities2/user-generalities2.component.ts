import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { addIcons } from 'ionicons';
import { list, save } from 'ionicons/icons/index';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonBackButton,
  IonFooter,
  IonFabButton,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonTab,
  IonIcon,
  IonNote,
  IonDatetime,
  IonFab,
  IonToggle,
  IonTextarea,
} from '@ionic/angular/standalone';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { Evaluation4StudentComponent } from '../evaluation4-student/evaluation4-student.component';
import { ReservedNotes4studentComponent } from '../reserved-notes4student/reserved-notes4student.component';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { IonTextareaCustomEvent } from '@ionic/core';
import { ClassesFieldComponent } from 'src/app/pages/classes/components/classes-field/classes-field.component';
import { IonicModule, TextareaChangeEventDetail } from "@ionic/angular";
import { AssignedClass } from 'src/app/pages/subjects-list/models/assignedClass';
@Component({
  selector: 'app-user-generalities2',
  templateUrl: './user-generalities2.component.html',
  styleUrls: ['./user-generalities2.component.scss'],
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
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonTab,
    ReservedNotes4studentComponent,
    IonLabel,
    Evaluation4StudentComponent,
    IonItem,
    IonSelectOption,
    IonNote,
    IonDatetime,
    ClassesFieldComponent,
    IonToggle,
    IonFooter,
    IonFab,
    IonFabButton,
    IonIcon,
    IonTextarea,
    IonInput,
    IonSelect,
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
  private destroyRef = inject(DestroyRef);
  constructor(
    private $users: UsersService,
    private $classes: ClassiService,
    private toaster: ToasterService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      'save': 'save-outline',
      'pdf': 'pdf-outline'
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
    addIcons({
      'save': 'save-outline',
      'listCircleOutline': 'list-circle-outline',
    });
  }

  // Metodo per gestire il cambiamento delle classi
  onClassesChange(classes: ClasseModel[]) {
    this.userForm.get('classes')?.setValue(classes);
  }

  onNoteDisabilitaChange($event: IonTextareaCustomEvent<TextareaChangeEventDetail>) {
    console.log("Note disabilità changed:", $event.detail.value);

    const value = $event.detail.value;
    this.userForm.get('noteDisabilita')?.setValue(value);
    this.userForm.updateValueAndValidity();
  }

  private readonly userEffect = effect(async () => {
    const loggedUser = await this.$users.getLoggedUser();
    console.log("logged user*", loggedUser)
    const user = this.user();
    if (loggedUser) {
      this.elencoClassi.set(loggedUser.assignedClases)
    }
    console.log("elenco classi*", this.elencoClassi())
    console.log('User input changed on effect*:', user);
    if (user.key) {
      console.log("User key:", user.key);
      // Update classes from user
      if (user.classesKey) {
        const classPromises = user.classesKey.map((classKey: string) => this.$classes.fetchClasseOnCache(classKey));
        const classResults = await Promise.all(classPromises);
        const classi = classResults.filter((classe): classe is ClasseModel => classe !== undefined);
        console.log("Classi aggiunte:", classi);

      }
      this.syncFormWithUser(user);
      this.logFormState();
    }
  });
  ngOnInit() {
    console.log('UserGeneralities2Component - ngOnInit*');
    console.log('User input value on init*:', this.user());
    this.cdr.detectChanges();
    const rolesKey = Object.keys(UsersRole);
    this.rolesValue = Object.values(UsersRole).slice(rolesKey.length / 2);
    console.log("ngOnInit - user:*", this.user());
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
    console.log('UserGeneralities2Component - ngAfterViewInit');
    console.log('Form controls after view init:', this.userForm.controls);

    // Forza un ulteriore controllo dopo l'inizializzazione della vista
    setTimeout(() => {
      console.log('Form values after timeout:', this.userForm.value);
      this.cdr.detectChanges();
    });
  }
  save() {
    console.log("Saving user...");
    const formValue = this.userForm.value;
    console.log("Form value:", formValue);
    const userData = {
      ...this.user(),
      ...formValue,
      classes: formValue.classes || []
    };

    const user = new UserModel(userData);
    console.log("User to save:", user.serialize());

    const claims = {
      role: user.role,
      classes: user.classes,
      classKey: user.classe,
    };

    console.log("Claims to set:", claims);

    if (user.key) {
      this.updateUser(user, claims);
    } else {
      this.createUser(user, claims);
    }
  }


  private updateUser(user: UserModel, claims: any) {
    console.log("Updating user...", user);
    this.$users.updateUser(user.key, user)
      .then(() => {
        console.log("User updated successfully");
        this.toaster.presentToast({
          message: "Utente aggiornato con successo",
          duration: 2000,
          position: "bottom"
        });
        return this.updateUserClaims(user.key, claims);
      })
      .catch(error => {
        console.error("Error updating user:", error);
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

  logFormState() {
    console.log('Form controls:', this.userForm.controls);
    console.log('noteDisabilita control:', this.userForm.get('noteDisabilita'));
    console.log('noteDisabilita value:', this.userForm.get('noteDisabilita')?.value);
    console.log('classes control:', this.userForm.get('classes'));
    console.log('firstName value:', this.userForm.get('firstName')?.value);
    console.log('lastName value:', this.userForm.get('lastName')?.value);
    console.log('userName value:', this.userForm.get('userName')?.value);
    console.log('email value:', this.userForm.get('email')?.value);
    console.log('role value:', this.userForm.get('role')?.value);
    console.log('DVA value:', this.userForm.get('DVA')?.value);
    console.log('DSA value:', this.userForm.get('DSA')?.value);
    console.log('BES value:', this.userForm.get('BES')?.value);
    console.log('ADHD value:', this.userForm.get('ADHD')?.value);
    console.log('noteDisabilita value:', this.userForm.get('noteDisabilita')?.value);
    console.log('pdpUrl value:', this.userForm.get('pdpUrl')?.value);
    console.log('phoneNumber value:', this.userForm.get('phoneNumber')?.value);
    console.log('birthDate value:', this.userForm.get('birthDate')?.value);
    console.log('classe value:', this.userForm.get('classe')?.value);
    console.log('classes value:', this.userForm.get('classes')?.value);
    console.log('Form state:', this.userForm.value);
  }
  syncFormWithUser(user: UserModel) {
    console.log("syncFormWithUser - user:*", user);
    if (!this.userForm) {
      console.error('Form non inizializzata!*');
      return;
    }

    console.log("Form controls before patch:*", Object.keys(this.userForm.controls));

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
          pdpUrl: user.pdpUrl || '',
          phoneNumber: user.phoneNumber || '',
          birthDate: user.birthDate || '',
          classKey: user.classKey || '',
          classes: user.classesKey || []
        }, { emitEvent: false });  // Aggiungi emitEvent: false
        this.cdr.detectChanges();  // Forza il rilevamento delle modifiche
        this.userForm.updateValueAndValidity();
        console.log("Form dopo la sincronizzazione:*", this.userForm.value)
      } catch (error) {
        console.error("Error patching form with user:*", error);
      }
    }
    else {
      console.warn("User is null or undefined*");
    }
  }

}
