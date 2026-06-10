import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { UserModel } from 'src/app/shared/models/userModel';
import { inject } from '@angular/core';
import { UsersService } from 'src/app/shared/services/users.service';
import { Evaluation4StudentComponent } from "src/app/pages/users/components/evaluation4-student/evaluation4-student.component";
/**
 * Pagina per visualizzare le valutazioni specifiche di uno studente.
 * Utilizza il componente `Evaluation4StudentComponent` per la visualizzazione dettagliata.
 */
import { addIcons } from 'ionicons';
import { chevronBack, chevronForward, peopleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-evaluations4-student',
  templateUrl: './evaluations4-student.page.html',
  styleUrls: ['./evaluations4-student.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    Evaluation4StudentComponent,
    IonBackButton,
    IonButtons,
    IonButton,
    IonIcon
  ]
})
export class Evaluations4StudentPage implements OnInit {
  studentKey = '';
  teacherKey = '';
  classKey = '';
  student = signal<UserModel>(new UserModel());
  prevStudentKey = signal<string | null>(null);
  nextStudentKey = signal<string | null>(null);
  subjectKey = signal<string | null>(null);

  $users = inject(UsersService);
  private router = inject(Router);

  constructor(private route: ActivatedRoute) {
    console.log("Evaluations4StudentPage");
    addIcons({ chevronBack, chevronForward, peopleOutline });
  }

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.studentKey = params['studentKey'];
      this.teacherKey = params['teacherKey'];
      console.log("studentKey", this.studentKey);
      console.log("teacherKey", this.teacherKey);
      const user = await this.$users.getUserByUid(this.studentKey);
      if (user) {
        this.student.set(user);
      }
    });

    this.route.queryParams.subscribe(params => {
      this.classKey = params['classKey'];
      this.subjectKey.set(params['subjectKey'] || null);
      if (this.classKey) {
        this.loadClassStudents();
      }
    });
  }

  private loadClassStudents() {
    this.$users.getUsersByClass(this.classKey, (users: UserModel[]) => {
      const sortedUsers = users.sort((a, b) => {
        const nameA = `${a.lastName} ${a.firstName}`;
        const nameB = `${b.lastName} ${b.firstName}`;
        return nameA.localeCompare(nameB);
      });
      
      const currentIndex = sortedUsers.findIndex(u => u.key === this.studentKey);
      if (currentIndex !== -1) {
        this.prevStudentKey.set(currentIndex > 0 ? sortedUsers[currentIndex - 1].key : null);
        this.nextStudentKey.set(currentIndex < sortedUsers.length - 1 ? sortedUsers[currentIndex + 1].key : null);
      }
    });
  }

  goToStudent(studentKey: string) {
    this.router.navigate(['/evaluations4-student', studentKey, this.teacherKey], { 
      queryParams: { classKey: this.classKey, subjectKey: this.subjectKey() } 
    });
  }

  goToClassDialog() {
    if (this.classKey) {
      this.router.navigate(['/class-dialog', this.classKey]);
    }
  }

}
