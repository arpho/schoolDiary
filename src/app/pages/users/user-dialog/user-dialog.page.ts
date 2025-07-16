import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { signal } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { ClassesFieldComponent } from '../../classes/components/classes-field/classes-field.component';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { user } from '@angular/fire/auth';
import { ClassiService } from '../../classes/services/classi.service';
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
    ClassesFieldComponent
  ]
})
export class UserDialogPage implements OnInit {
  userKey = "";
userSignal = signal(new UserModel());
rolesValue: any[] = [];
rolesName: string[] = [];
userForm: FormGroup= new FormGroup({
  firstName: new FormControl(''),
  lastName: new FormControl(''),
  userName: new FormControl(''),
  email: new FormControl(''),
  role: new FormControl(''),
  phoneNumber: new FormControl(''),
  birthDate: new FormControl(''),
  classes: new FormControl(''),
});
usersClasses= signal<ClasseModel[]>([]);
$UsersRole = UsersRole;
  constructor(
      private router: Router,
      private $users: UsersService,
      private $classes: ClassiService
    ) { 
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
     const rolesKey = Object.keys(UsersRole);
     this.rolesValue = Object.values(UsersRole).slice(rolesKey.length/2);
     console.log("rolesKey", rolesKey);
     console.log("rolesValue", this.rolesValue);
    const navigation = this.router.getCurrentNavigation();
    this.userKey = navigation?.extras.state?.['userKey'];
    if(this.userKey){   
      this.$users.fetchUser(this.userKey).then((user) => {
        if(user){
          this.userSignal.set(user);
          this.userForm.setValue({
            firstName: user?.firstName,
            lastName: user?.lastName,
            userName: user?.userName,
            email: user?.email,
            role: user?.role,
            phoneNumber: user?.phoneNumber,
            birthDate: user?.birthDate,
            classes: user?.classes,      
              });
          
            
        }
        }
      )   ;
    console.log("user", this.userSignal());

  }
}
}
