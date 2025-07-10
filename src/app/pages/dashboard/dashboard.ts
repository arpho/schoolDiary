import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { UsersService } from 'src/app/shared/services/users.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { DashboardAdmin } from 'src/app/shared/components/dashboard-admin';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { DashboardTeacher } from 'src/app/shared/components/dashboard-teacher/dashboard-teacher';
import { DashboardStudent } from 'src/app/shared/components/dashboard-student/dashboard-student';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class Dashboard implements OnInit {
  loggdUser= signal<UserModel>(new UserModel());
  dashboards = {
    3: DashboardAdmin,
    2: DashboardTeacher,
    1: DashboardStudent
  }

  constructor(private Users: UsersService) { }

  async ngOnInit() {
   this.loggdUser.set(await  this.Users.getLoggedUser())
   console.log("loggdUser",this.loggdUser())
   console.log("role",this.loggdUser().role)
   console.log("dashboard",this.dashboards[this.loggdUser().role])
  }
}
