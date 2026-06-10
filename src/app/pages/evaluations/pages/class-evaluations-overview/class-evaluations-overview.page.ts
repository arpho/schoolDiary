import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, 
  IonGrid, IonRow, IonCol, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonBadge, IonSelect, IonSelectOption 
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { addIcons } from 'ionicons';
import { saveOutline, createOutline, bookOutline } from 'ionicons/icons';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';

@Component({
  selector: 'app-class-evaluations-overview',
  templateUrl: './class-evaluations-overview.page.html',
  styleUrls: ['./class-evaluations-overview.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonGrid, IonRow, IonCol, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonBadge,
    IonSelect, IonSelectOption,
    CommonModule, FormsModule
  ]
})
export class ClassEvaluationsOverviewPage implements OnInit {
  classKey = '';
  teacherKey = '';
  students = signal<UserModel[]>([]);
  studentAverages = signal<Map<string, number>>(new Map());

  selectedSubjectKey = signal<string | null>(null);
  availableSubjects = signal<SubjectModel[]>([]);

  // Stato locale per l'editing dei voti finali per ogni studente: studentKey -> { voto, data, nota, subjectKey }
  editingGrades = signal<Map<string, { voto: number, data: string, nota: string, subjectKey?: string }>>(new Map());

  $users = inject(UsersService);
  $evaluations = inject(EvaluationService);
  $subjects = inject(SubjectService);

  constructor(private route: ActivatedRoute, private router: Router) {
    addIcons({ saveOutline, createOutline, bookOutline });
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
    this.$users.getUsersByClass(this.classKey, async (users: UserModel[]) => {
      const sortedUsers = users.sort((a, b) => {
        const nameA = `${a.lastName} ${a.firstName}`;
        const nameB = `${b.lastName} ${b.firstName}`;
        return nameA.localeCompare(nameB);
      });
      this.students.set(sortedUsers);
      
      await this.loadAvailableSubjects();
      
      this.loadAverages(sortedUsers);
      this.initEditingStates(sortedUsers);
    });
  }

  private async loadAvailableSubjects() {
    if (!this.teacherKey) return;
    const teacher = await this.$users.getUser(this.teacherKey);
    if (teacher && teacher.assignedClasses) {
      const assignedClass = teacher.assignedClasses.find(c => c.key === this.classKey);
      if (assignedClass && assignedClass.subjectsKey && assignedClass.subjectsKey.length > 0) {
        const subjects = await this.$subjects.fetchSubjectsByKeys(assignedClass.subjectsKey);
        this.availableSubjects.set(subjects);
      }
    }
  }

  loadAverages(users: UserModel[]) {
    if (!this.teacherKey) return;
    const selectedSubj = this.selectedSubjectKey();
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
        },
        selectedSubj || undefined
      );
    });
  }

  initEditingStates(users: UserModel[]) {
    const map = new Map<string, { voto: number, data: string, nota: string, subjectKey?: string }>();
    const selectedSubj = this.selectedSubjectKey();

    users.forEach(user => {
      let lastGrade: { voto: number, data: string, nota: string, subjectKey?: string } = { voto: 0, data: new Date().toISOString().split('T')[0], nota: '', subjectKey: selectedSubj || undefined };
      
      if (user.finalGrades && user.finalGrades.length > 0) {
        // Filtra i voti finali che corrispondono alla materia selezionata
        const gradesForSubj = user.finalGrades.filter(g => g.subjectKey === selectedSubj || (!g.subjectKey && !selectedSubj));
        if (gradesForSubj.length > 0) {
          lastGrade = { ...gradesForSubj[gradesForSubj.length - 1] };
        }
      }
      
      map.set(user.key, lastGrade);
    });
    this.editingGrades.set(map);
  }

  onSubjectChange(subjectKey: string | null) {
    this.selectedSubjectKey.set(subjectKey);
    this.loadAverages(this.students());
    this.initEditingStates(this.students());
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

    const selectedSubj = this.selectedSubjectKey();
    
    // Troviamo se esiste già un voto finale per questa materia in modo da sovrascriverlo, oppure aggiungiamo
    const existingIndex = student.finalGrades.findIndex(g => g.subjectKey === selectedSubj || (!g.subjectKey && !selectedSubj));
    if (existingIndex >= 0) {
      student.finalGrades[existingIndex] = { ...gradeObj, subjectKey: selectedSubj || undefined };
    } else {
      student.finalGrades.push({ ...gradeObj, subjectKey: selectedSubj || undefined });
    }

    // Salviamo l'utente
    await this.$users.updateUser(student.key, student);
    console.log(`Voto finale salvato per ${student.lastName}`);
  }

  goToStudentEvaluations(studentKey: string) {
    if (this.teacherKey) {
      this.router.navigate(['/evaluations4-student', studentKey, this.teacherKey]);
    }
  }
}
