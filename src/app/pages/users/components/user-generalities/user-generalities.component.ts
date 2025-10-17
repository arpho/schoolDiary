import { Subject } from 'rxjs';
import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  signal, 
  effect, 
  DestroyRef,
  inject,
  input,
  output,
  EventEmitter,
  model
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormsModule, 
  ReactiveFormsModule, 
  FormGroup, 
  FormBuilder, 
  Validators, 
  FormControl 
} from '@angular/forms';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { UsersService } from 'src/app/shared/services/users.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ClassesFieldComponent } from 'src/app/pages/classes/components/classes-field/classes-field.component';
import { addIcons } from 'ionicons';
import { save } from 'ionicons/icons/index';
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
  IonDatetime,
  IonFab
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-user-generalities',
  templateUrl: './user-generalities.component.html',
  styleUrls: ['./user-generalities.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonContent, 
    IonItem,
    IonLabel,
    IonNote,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonFooter,
    IonFabButton,
    IonIcon,
    IonDatetime,
    IonFab,
    ClassesFieldComponent
  ],
})
export class UserGeneralitiesComponent  implements OnInit {
  private destroy$ = new Subject<void>();

  // Metodo per gestire il cambiamento delle classi
  onClassesChange(classes: ClasseModel[]) {
    this.userForm.get('classes')?.setValue(classes);
  }

  save() {
    console.log("Saving user...");
    const formValue = this.userForm.value;
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

  editeduser = output<UserModel>();
  user = input<UserModel>(new UserModel({ role: UsersRole.STUDENT }));
  rolesValue: any[] = [];
  rolesName: string[] = [];
  elencoClassi = signal<ClasseModel[]>([]);
  userForm!: FormGroup;
  usersClasses = signal<ClasseModel[]>([]);
  $UsersRole = UsersRole;
  private destroyRef = inject(DestroyRef);

  constructor(
    private $users: UsersService,
    private $classes: ClassiService,
    private toaster: ToasterService,
    private fb: FormBuilder
  ) { 
    // Initialize form
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      userName: [''],
      email: ['', [Validators.required, Validators.email]],
      role: [UsersRole.STUDENT, Validators.required],
      phoneNumber: [''],
      birthDate: [''],
      classes: [[]],
      classe: ['']
    });

    // Add icons
    addIcons({ save });

    // Effect to handle user changes
    effect(() => {
      const user = this.user();
      console.log("Effect - User changed:", user);
      
      if (user) {
        // Update classes from user
        const classi: ClasseModel[] = [];
        if (user.classesKey) {
          user.classesKey.forEach((classKey: string) => {
            const classe = this.$classes.fetchClasseOnCache(classKey);
            if (classe) {
              classi.push(classe);
            }
          });
        }
        
        
        this.usersClasses.set(classi);
        this.syncFormWithUser();
      }
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

  

  private syncFormWithUser() {
    const user = this.user();
    if (!user) return;
  
    console.log("Sincronizzazione form con utente:*", user);
    const classi: ClasseModel[] = [];
    user.classesKey.forEach((classKey: string) => {
      const classe = this.$classes.fetchClasseOnCache(classKey);
      if (classe) {
        classi.push(classe);
      }
    });
    this.usersClasses.set(classi);
    
    this.userForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      userName: user.userName || '',
      email: user.email || '',
      role: user.role || UsersRole.STUDENT,
      phoneNumber: user.phoneNumber || '',
      birthDate: user.birthDate || '',
      classes: user.classes || [],
      classe: user.classKey || ''
    }, { emitEvent: false });
    console.log("Form dopo la sincronizzazione:*", this.userForm.value)
  }

  async ngOnInit() {
    console.log("ngOnInit - user:*", this.user());
   const loggedUser =await  this.$users.getLoggedUser();
   if(loggedUser){
    console.log("user logged", loggedUser)
    this.elencoClassi.set(loggedUser.classi);
   console.log("classi in logged user", loggedUser.classi);
   }
    const rolesKey = Object.keys(UsersRole);
    this.rolesValue = Object.values(UsersRole).slice(rolesKey.length/2);

    
    // Sincronizza il form con i valori iniziali
    this.syncFormWithUser();
    
    // Ascolta i cambiamenti del Signal user
   
  }



}
