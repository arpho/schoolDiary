import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { UserModel } from 'src/app/shared/models/userModel';
import { inject } from '@angular/core';
import { UsersService } from 'src/app/shared/services/users.service';
import { Evaluation4StudentComponent } from "src/app/pages/users/components/evaluation4-student/evaluation4-student.component";
@Component({
  selector: 'app-evaluations4-student',
  templateUrl: './evaluations4-student.page.html',
  styleUrls: ['./evaluations4-student.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, Evaluation4StudentComponent]
})
export class Evaluations4StudentPage implements OnInit {
  studentKey = '';
  teacherKey = '';
  student = signal<UserModel>(new UserModel());
  $users = inject(UsersService);

  constructor(private route:ActivatedRoute) {
    console.log("Evaluations4StudentPage");
   }

   ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.studentKey = params['studentKey'];
      this.teacherKey = params['teacherKey'];
      console.log("studentKey", this.studentKey);
      console.log("teacherKey", this.teacherKey);
    const user = await this.$users.getUserByUid(this.studentKey);
    if(user){
      this.student.set(user);
    }
    
    });
  }

}
