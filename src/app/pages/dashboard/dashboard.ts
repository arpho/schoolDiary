import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { UsersService } from 'src/app/shared/services/users.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { DashboardAdminComponent } from 'src/app/shared/components/dashboard-admin/dashboard-admin';
import { UsersRole } from 'src/app/shared/models/usersRole';
import { DashboardTeacherComponent } from 'src/app/shared/components/dashboard-teacher/dashboard-teacher';
import { DashboardStudentComponent } from 'src/app/shared/components/dashboard-student/dashboard-student';
import { LogoutComponent } from 'src/app/shared/components/logout/logout.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    LogoutComponent
    ]
})
export class DashboardPage implements OnInit {
  private Users = inject(UsersService);

  loggdUser= signal<UserModel>(new UserModel());
  dashboards = {
    [UsersRole.ADMIN]: DashboardAdminComponent,
    [UsersRole.TEACHER]: DashboardTeacherComponent,
    [UsersRole.STUDENT]: DashboardStudentComponent
  }

  async ngOnInit() {
    const loggedUser = await this.Users.getLoggedUser();
    if(loggedUser ){
      console.log("loggedUser",loggedUser)
   this.loggdUser.set(loggedUser)
   console.log("loggdUser",this.loggdUser())
   console.log("role",this.loggdUser().role)
   console.log("dashboard",this.dashboards[this.loggdUser().role])
    }
  }
}
