import { Component, effect, EventEmitter, Input, input, OnInit, Output, signal } from '@angular/core';
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
  userSignal = signal(new UserModel({ role: UsersRole.STUDENT }));
 @Input() userkey : string="";
 @Output() editeduser= new EventEmitter<UserModel>();
 user = signal<UserModel>(new UserModel({ role: UsersRole.STUDENT }));
rolesValue: any[] = [];
rolesName: string[] = [];
elencoClassi= signal<ClasseModel[]>([]);
userForm: FormGroup= new FormGroup({
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
usersClasses= signal<ClasseModel[]>([]);
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
    console.log("userForm valueChanges", value);
    this.userSignal.set(new UserModel(value).setKey(this.userkey));
    console.log("userSignal", this.userSignal());
    this.editeduser.emit(this.userSignal());
  })
    effect(async()=>{
      const classesKeys = this.userSignal()?.classes;
      if(classesKeys){
        this.$classes.fetchClasses(classesKeys).then((classes) => {
          this.usersClasses.set(classes);
        });
      }
    })
  }

  ngOnInit() {
    this.elencoClassi= this.$classes.classesOnCache;
    const rolesKey = Object.keys(UsersRole);
    this.rolesValue = Object.values(UsersRole).slice(rolesKey.length/2);
    console.log("userkey**", this.userkey)  
    this.$users.fetchUser(this.userkey).then((user) => {
      if(user){
        this.userSignal.set(user);
        this.userForm.setValue({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          userName: user?.userName || '',
          email: user?.email || '',
          role: user?.role || UsersRole.STUDENT,
          phoneNumber: user?.phoneNumber || '',
          birthDate: user?.birthDate || '',
          classes: user?.classes || [],
          classe: user?.classKey || ''
        });

console.log("user*", this.userSignal());
      }
    })   ;
       
  }


save() {
  console.log("save*",);
  console.log("userForm*", this.userForm.value )
  const user = new UserModel(this.userForm.value);
  user.key = this.userkey;
  user.classes = this.usersClasses().map((classe) => classe.key);
  this.userSignal.set(user);
  console.log("userSignal*", this.userSignal());
  const claims = {
    role: user.role,
    classes: user.classes,
    classKey: user.classe
  }
  console.log("claims", claims)
  this.$users.updateUser(user.key, user).then(() => {
    console.log("user updated");
    this.toaster.presentToast({message:"User aggiornato con successo",duration:2000,position:"bottom"});
  }).catch((error: any) => {
    console.log("error updating user", error);
    this.toaster.presentToast({message:"Errore durante l'aggiornamento del user",duration:2000,position:"bottom"});
  })
  this.$users.setUserClaims2user(user.key, claims).then(async (data:any) => {
    console.log("claims set",data);
    const usersClaims =await this.$users.getCustomClaims4LoggedUser();
    console.log("usersClaims", usersClaims);
    this.toaster.presentToast({message:"Claims aggiornati con successo",duration:2000,position:"bottom"});
  }).catch((error: any) => {
    console.log("error setting claims", error);
    this.toaster.presentToast({message:"Errore durante l'aggiornamento dei claims",duration:2000,position:"bottom"});
  })
  }

}
