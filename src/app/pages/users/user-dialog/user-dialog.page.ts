import {
   Component,
   effect,
   OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormsModule,
  ReactiveFormsModule,
  Validators } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
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
  IonFab } from '@ionic/angular/standalone';
import {
   ActivatedRoute,
   Router 
  } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { signal } from '@angular/core';
import {
   FormGroup,
    FormControl
  } from '@angular/forms';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { ClassesFieldComponent } from '../../classes/components/classes-field/classes-field.component';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { user } from '@angular/fire/auth';
import { ClassiService } from '../../classes/services/classi.service';
import { addIcons } from 'ionicons';
import { save } from 'ionicons/icons';
@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.page.html',
  styleUrls: ['./user-dialog.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonBackButton,
    ClassesFieldComponent,
    IonDatetime,
    IonFooter,
    IonFabButton,
    IonIcon,
    IonFab
]
})
export class UserDialogPage implements OnInit {
save() { 
console.log("save",);
const user = new UserModel(this.userForm.value);
user.key = this.userSignal()?.key;
user.classes = this.usersClasses().map((classe) => classe.key);
this.userSignal.set(user);
console.log("userSignal", this.userSignal());
const claims = {
  role: user.role,
  classes: user.classes,
  classKey: user.classe
}
console.log("claims", claims)
this.$users.setUserClaims2user(user.key, claims).then(async (data:any) => {
  console.log("claims set",data);
  const usersClaims =await this.$users.getCustomClaims4LoggedUser();
  console.log("usersClaims", usersClaims);
}).catch((error: any) => {
  console.log("error setting claims", error);
})
}
userSignal = signal(new UserModel({ role: UsersRole.STUDENT }));
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
      private $classes: ClassiService
    ) { 
      addIcons({
        save,
      });
      effect(async()=>{
        const classesKeys = this.userSignal()?.classes;
        if(classesKeys){
          this.$classes.fetchClasses(classesKeys).then((classes) => {
            this.usersClasses.set(classes);
          });
        } 
      })
    }

  async ngOnInit() {
    this.$classes.getClassiOnRealtime((classi) => {
      this.elencoClassi.set(classi);
    });
    const userKey=this.router.snapshot.paramMap.get('userKey');
     const rolesKey = Object.keys(UsersRole);
     this.rolesValue = Object.values(UsersRole).slice(rolesKey.length/2);
    if(userKey){   
      this.$users.fetchUser(userKey).then((user) => {
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
          
            
        }
        }
      )   ;
    console.log("user", this.userSignal());
    const claims =  await this.$users.getCustomClaims4LoggedUser();
    console.log("claims", claims);

  }
}
}
