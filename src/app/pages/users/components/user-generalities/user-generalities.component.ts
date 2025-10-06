import { Component, computed, effect, EventEmitter, Input, input, model, OnInit, Output, signal } from '@angular/core';
import { IonContent } from "@ionic/angular/standalone";
import { IonicModule } from "@ionic/angular";
import { ClassesFieldComponent } from "src/app/pages/classes/components/classes-field/classes-field.component";
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { ActivatedRoute } from '@angular/router';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { addIcons } from 'ionicons';
import { save } from 'ionicons/icons';
import {
   IonDatetime,
    IonItem,
    IonLabel,
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
    IonContent,
    ClassesFieldComponent,
    ReactiveFormsModule,
    FormsModule,
    IonDatetime,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonBackButton,
    IonButton,
    IonDatetime,
    IonFooter,
    IonFabButton,
    IonIcon,
    IonButtons,
    IonFab,
    UserGeneralitiesComponent
  ],
})
export class UserGeneralitiesComponent  implements OnInit {
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
 user = model<UserModel>(new UserModel({ role: UsersRole.STUDENT }));
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
    private router: ActivatedRoute,
    private $users: UsersService,
    private $classes: ClassiService,
    private toaster: ToasterService
  ) { 

    addIcons({
      save,
    });
  this.userForm.valueChanges.subscribe((value) => {
    console.log("valueChanges on form:", value);
    const userFormValid = computed(() => this.userForm.valid);
    console.log("userForm valid", userFormValid());
    console.log("userForm errors", this.userForm.errors);
    console.log("email valida", this.userForm.get('email')?.valid);

    const currentUser = this.user();
    const updatedUser = new UserModel({
      ...currentUser,          // Mantiene tutti i valori esistenti
      ...value,                // Sovrascrive con i valori del form
      key: currentUser?.key,   // Mantiene la chiave esistente
      classi: currentUser?.classi,  // Mantiene le classi esistenti
      classesKey: value.classe || currentUser?.classesKey  // Aggiorna classesKey solo se c'è un nuovo valore
    });
    
    this.user.set(updatedUser);
    console.log("userSignal aggiornato:", updatedUser);
  })
    effect(async()=>{
      const classesKeys = this.user()?.classesKey;
      console.log("setting classi*", this.user());
    this.usersClasses.set(this.user().classi);
    })
  }

  ngOnInit() {
    console.log("userkey**", this.user().key)  
    this.elencoClassi= this.$classes.classesOnCache;
    const rolesKey = Object.keys(UsersRole);
    this.rolesValue = Object.values(UsersRole).slice(rolesKey.length/2);
    console.log("userkey**", this.user().key)  
      this.usersClasses.set(this.user().classi || []);  
      console.log("usersClasses*", this.usersClasses());
      
        this.userForm.setValue({
          firstName: this.user()?.firstName || '',
          lastName: this.user()?.lastName || '',
          userName: this.user()?.userName || '',
          email: this.user()?.email || '',
          role: this.user()?.role || UsersRole.STUDENT,
          phoneNumber: this.user()?.phoneNumber || '',
          birthDate: this.user()?.birthDate || '',
          classes: this.user()?.classes || [],
          classe: this.user()?.classKey || ''
        });

console.log("user*", this.user());
      
    }   
  }





