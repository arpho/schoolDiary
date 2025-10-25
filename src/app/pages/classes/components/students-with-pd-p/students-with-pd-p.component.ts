import { Component, OnInit, ChangeDetectionStrategy, inject, input, effect, signal } from '@angular/core';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { ClasseModel } from '../../models/classModel';
import { OrCondition, QueryCondition } from 'src/app/shared/models/queryCondition';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonList,
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-students-with-pd-p',
  templateUrl: './students-with-pd-p.component.html',
  styleUrls: ['./students-with-pd-p.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    ReactiveFormsModule,
    FormsModule
]
})
export class StudentsWithPdPComponent  implements OnInit {
  formName(user: UserModel) {
    console.log("formName", user);
return `${user.lastName} ${user.firstName}`;
}
private $users = inject(UsersService);
classe = input<ClasseModel>(new ClasseModel());
students = signal<UserModel[]>([]);

  constructor() { 
    effect(() => {
      console.log("studentsWithPdPComponent", this.classe());
      const classeKey = this.classe().key;
      if(classeKey){
        this.$users.getUsersOnRealTime((users: UserModel[]) => {
          console.log("students with pdp", users);
          this.students.set(users);
        },[new QueryCondition('classKey', '==', classeKey)],
        new OrCondition([
          new QueryCondition('DVA', '==', true),
          new QueryCondition('BES', '==', true),
          new QueryCondition('DSA', '==', true),
        ]))
      }

    });
  }

  ngOnInit() {
    console.log('ngOnInit chiamato');
  }

}
