import { Component, OnInit, ChangeDetectionStrategy, inject, input, effect, signal } from '@angular/core';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { ClasseModel } from '../../models/classModel';
import { OrCondition, QueryCondition } from 'src/app/shared/models/queryCondition';

@Component({
  selector: 'app-students-with-pd-p',
  templateUrl: './students-with-pd-p.component.html',
  styleUrls: ['./students-with-pd-p.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentsWithPdPComponent  implements OnInit {
private $users = inject(UsersService);
classe = input<ClasseModel>(new ClasseModel());
students = signal<UserModel[]>([]);

  constructor() { 
    effect(() => {
      console.log("studentsWithPdPComponent", this.classe());
      const classeKey = this.classe().key;
      if(classeKey){
        this.$users.getUsersOnRealTime((users: UserModel[]) => {
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

  ngOnInit() {}

}
