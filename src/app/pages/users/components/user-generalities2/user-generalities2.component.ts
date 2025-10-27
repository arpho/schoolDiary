import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { addIcons } from 'ionicons';
import { save } from 'ionicons/icons/index';
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
import { UserGeneralitiesComponent } from '../user-generalities/user-generalities.component';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { IonTextareaCustomEvent } from '@ionic/core';
import { ClassesFieldComponent } from 'src/app/pages/classes/components/classes-field/classes-field.component';
import { IonicModule, TextareaChangeEventDetail } from "@ionic/angular";
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
    IonTextarea
  ]
})
export class UserGeneralities2Component  implements OnInit {
  user = input<UserModel>(new UserModel({ role: UsersRole.STUDENT }));
userForm!: FormGroup;

rolesValue: any[] = [];
rolesName: string[] = [];
elencoClassi = signal<ClasseModel[]>([]);

usersClasses = signal<ClasseModel[]>([]);
$UsersRole = UsersRole;
private destroyRef = inject(DestroyRef);
  constructor(
    private $users: UsersService,
    private $classes: ClassiService,
    private toaster: ToasterService,
    private fb: FormBuilder
  ) { 
addIcons({
  save,
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

    private readonly userEffect = effect(() => {
      const user = this.user();
      console.log('User input changed on effect*:', user);
      if (user.key) {
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
        this.syncFormWithUser(user);
        this.logFormState();
      }
    });
  ngOnInit() {
    const rolesKey = Object.keys(UsersRole);
    this.rolesValue = Object.values(UsersRole).slice(rolesKey.length/2);
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
      noteDisabilita: [''],
      pdpUrl: [''],
      phoneNumber: [''],
      birthDate: [''],
      classe: [''],
      classes: [[]]
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
  }
  syncFormWithUser(user: UserModel) {
    console.log("syncFormWithUser - user:*", user);
    if(user.key){
    this.userForm.patchValue({  
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      userName: user.userName || '',
      email: user.email || '',
      role: user.role || UsersRole.STUDENT,
      DVA: user.DVA || false,
      DSA: user.DSA || false,
      BES: user.BES || false,
      noteDisabilita: user.noteDisabilita || '',
      pdpUrl: user.pdpUrl || '',
      phoneNumber: user.phoneNumber || '',
      birthDate: user.birthDate || '',
      classe: user.classKey || '',
      classes: user.classesKey || []
    });
    this.userForm.updateValueAndValidity();
    console.log("Form dopo la sincronizzazione:*", this.userForm.value)
    }
  }

}
