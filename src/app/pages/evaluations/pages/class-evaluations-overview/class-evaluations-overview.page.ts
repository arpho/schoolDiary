import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, 
  IonGrid, IonRow, IonCol, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonBadge 
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { addIcons } from 'ionicons';
import { saveOutline, createOutline } from 'ionicons/icons';

@Component({
  selector: 'app-class-evaluations-overview',
  templateUrl: './class-evaluations-overview.page.html',
  styleUrls: ['./class-evaluations-overview.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonGrid, IonRow, IonCol, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonBadge,
    CommonModule, FormsModule
  ]
})
export class ClassEvaluationsOverviewPage implements OnInit {
  classKey = '';
  teacherKey = '';
  students = signal<UserModel[]>([]);
  studentAverages = signal<Map<string, number>>(new Map());

  // Stato locale per l'editing dei voti finali per ogni studente: studentKey -> { voto, data, nota }
  editingGrades = signal<Map<string, { voto: number, data: string, nota: string }>>(new Map());

  $users = inject(UsersService);
  $evaluations = inject(EvaluationService);

  constructor(private route: ActivatedRoute) {
    addIcons({ saveOutline, createOutline });
  }

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.classKey = params['classKey'];
      this.teacherKey = params['teacherKey'];
      if (this.classKey) {
        this.loadStudents();
      }
    });
  }

  private loadStudents() {
    this.$users.getUsersByClass(this.classKey, (users: UserModel[]) => {
      const sortedUsers = users.sort((a, b) => {
        const nameA = `${a.lastName} ${a.firstName}`;
        const nameB = `${b.lastName} ${b.firstName}`;
        return nameA.localeCompare(nameB);
      });
      this.students.set(sortedUsers);
      this.loadAverages(sortedUsers);
      this.initEditingStates(sortedUsers);
    });
  }

  private loadAverages(users: UserModel[]) {
    if (!this.teacherKey) return;
    users.forEach(student => {
      this.$evaluations.fetchAverageGrade4StudentAndTeacher(
        student.key,
        this.teacherKey,
        (average) => {
          this.studentAverages.update(map => {
            const newMap = new Map(map);
            newMap.set(student.key, average);
            return newMap;
          });
        }
      );
    });
  }

  private initEditingStates(users: UserModel[]) {
    const map = new Map<string, { voto: number, data: string, nota: string }>();
    users.forEach(user => {
      // Prendiamo l'ultimo voto finale se esiste, altrimenti un oggetto vuoto
      const lastGrade = (user.finalGrades && user.finalGrades.length > 0) 
        ? user.finalGrades[user.finalGrades.length - 1] 
        : { voto: 0, data: new Date().toISOString().split('T')[0], nota: '' };
      
      map.set(user.key, { ...lastGrade });
    });
    this.editingGrades.set(map);
  }

  updateGradeField(studentKey: string, field: 'voto' | 'data' | 'nota', value: any) {
    this.editingGrades.update(map => {
      const newMap = new Map(map);
      const gradeObj = newMap.get(studentKey);
      if (gradeObj) {
        if (field === 'voto') gradeObj.voto = Number(value);
        if (field === 'data') gradeObj.data = value;
        if (field === 'nota') gradeObj.nota = value;
      }
      return newMap;
    });
  }

  async saveFinalGrade(student: UserModel) {
    const gradeObj = this.editingGrades().get(student.key);
    if (!gradeObj || gradeObj.voto <= 0) return;

    if (!student.finalGrades) {
      student.finalGrades = [];
    }

    // Aggiungiamo o aggiorniamo il voto
    student.finalGrades.push({ ...gradeObj });

    // Salviamo l'utente
    await this.$users.updateUser(student.key, student);
    console.log(`Voto finale salvato per ${student.lastName}`);
  }

}
