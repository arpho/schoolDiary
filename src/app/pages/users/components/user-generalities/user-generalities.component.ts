import { Subject } from 'rxjs';
import { Component, effect, EventEmitter, input, OnInit, Output, signal } from '@angular/core';
import { IonContent } from "@ionic/angular/standalone";
import { ClassesFieldComponent } from "src/app/pages/classes/components/classes-field/classes-field.component";
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { addIcons } from 'ionicons';
import { save } from 'ionicons/icons';
import {
    IonItem,
    IonLabel,
    IonNote,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonBackButton,
    IonButton,
    IonFooter,
    IonFabButton,
    IonIcon,
    IonButtons,

    IonFab 
  } from '@ionic/angular/standalone';
@Component({
  selector: 'app-user-generalities',
  templateUrl: './user-generalities.component.html',
  styleUrls: ['./user-generalities.component.scss'],
  imports: [
    ClassesFieldComponent,
    ReactiveFormsModule,
    FormsModule,
    IonContent, 
    IonItem,
    IonLabel,
    IonNote,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonBackButton,
    IonButton,
    IonFooter,
    IonFabButton,
    IonIcon,
    IonButtons,
    IonFab,
    UserGeneralitiesComponent,

],
})
export class UserGeneralitiesComponent  implements OnInit {
  private destroy$ = new Subject<void>();
  fb: FormBuilder= new FormBuilder();
save() {
console.log("saving",this.user())
  const user = new UserModel(this.user());
console.log("user serialized",user.serialize())
const claims = {
  role: user.role,
  classes: user.classes,
  classKey: user.classe,
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
  console.log("user key not found, it is a new user",user); 
  this.$users.createUser(user).then((data: any) => {
    console.log("user created", data);
    this.toaster.presentToast({message: "User creato con successo", duration: 2000, position: "bottom"});
  }).catch((error: any) => {
    console.log("error creating user", error);
    this.toaster.presentToast({message: "Errore durante la creazione del user", duration: 2000, position: "bottom"});
  });

 }
}

 @Output() editeduser= new EventEmitter<UserModel>();
 user = input<UserModel>(new UserModel({ role: UsersRole.STUDENT }));
rolesValue: any[] = [];
rolesName: string[] = [];
elencoClassi= signal<ClasseModel[]>([]);
  userForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(1)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(1)]),
    userName: new FormControl('', ),
    email: new FormControl('', [Validators.email,Validators.required]),
    role: new FormControl(UsersRole.STUDENT),
    phoneNumber: new FormControl(''),
    birthDate: new FormControl(''),
    classes: new FormControl([]),
    classe: new FormControl('',[Validators.required])
  });

 
    
  usersClasses = signal<ClasseModel[]>([]);
  $UsersRole = UsersRole;

  constructor(
    private $users: UsersService,
    private $classes: ClassiService,
    private toaster: ToasterService
  ) { 

    addIcons({ save });

    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: [''],
      email: ['', [Validators.required, Validators.email]],
      role: [UsersRole.STUDENT, Validators.required],
      phoneNumber: [''],
      birthDate: [''],
      classes: [[]],
      classe: ['']
    });

    effect(() => {
      const user = this.user();
      console.log("Effect - Cambiamento user:", user);
      
      if (user) {
        console.log("Aggiornamento usersClasses con classi:", user.classi);
        this.usersClasses.set(user.classi || []);
        this.syncFormWithUser();
      } else {
        console.log("User è null o undefined");
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
  
    console.log("Sincronizzazione form con utente:", user);
    
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
    console.log("Form dopo la sincronizzazione:", this.userForm.value)
  }

  ngOnInit() {
    console.log("ngOnInit - user:", this.user());
    
    this.elencoClassi = this.$classes.classesOnCache;
    const rolesKey = Object.keys(UsersRole);
    this.rolesValue = Object.values(UsersRole).slice(rolesKey.length/2);
    
    // Sincronizza il form con i valori iniziali
    this.syncFormWithUser();
    
    // Ascolta i cambiamenti del Signal user
   
  }



}
