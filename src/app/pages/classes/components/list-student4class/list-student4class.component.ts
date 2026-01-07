import { Component, OnInit, Input, computed, OnChanges, SimpleChanges, effect } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonFab,
  ActionSheetController,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonDatetime
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { EvaluationService } from 'src/app/pages/evaluations/services/evaluation/evaluation.service';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { addIcons } from 'ionicons';
import {
  create,
  ellipsisVertical,
  sparkles,
  close,
  trash,
  eye,
  add,
  calendarOutline
} from 'ionicons/icons';
import { cloudUploadOutline } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { UploadStudentsComponent } from '../uploadStudents/upload-students/upload-students.component';
import { UserDialogPage } from '../../../users/user-dialog/user-dialog.page';
import { StudentAverageGradeDisplayComponent } from '../student-average-grade-display/student-average-grade-display.component';

@Component({
  selector: 'app-list-student4class',
  templateUrl: './list-student4class.component.html',
  styleUrls: ['./list-student4class.component.scss'],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonFab,
    IonFabButton,
    IonFabList,
    IonIcon,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonModal,
    CommonModule,
    FormsModule,
    StudentAverageGradeDisplayComponent
  ]
})
export class ListStudent4classComponent implements OnInit, OnChanges {
  dataInizioPeriodo = signal<string>(
    localStorage.getItem('dataInizioPeriodo') ||
    new Date(new Date().getFullYear(), 0, 2).toISOString()
  );
  async showActionSheet(student: UserModel) {
    console.log("action for", student)


    const actionSheet = await this.actionSheetController.create({
      header: `Studente ${student.lastName} ${student.firstName}`,
      subHeader: student.lastName || 'Nessuna descrizione',
      buttons: [
        {
          text: 'Modifica',
          icon: 'eye',
          handler: () => {
            this.editStudent(student.key)
          }
        },
        {
          text: 'nuova valutazione',

          icon: 'sparkles',
          handler: () => {
            this.newEvaluation(student.key);
          }
        },
        {
          text: 'Archivia',
          icon: 'archive',
          handler: () => {
            console.log("what?")
          }
        },
        {
          text: 'Annulla',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });

    await actionSheet.present();
  }
  teacherkey = signal<string>('');
  async addStudent() {
    console.log("adding student", this.classkey)
    const modal = await this.$modalController.create({
      component: UserDialogPage,
      componentProps: {
        classKey: this.classkey
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.loadStudents(); // Ricarica gli studenti se ne è stato aggiunto uno nuovo
    }
  }
  @Input() set classkey(value: string) {
    this._classkey = value;
    if (value) {
      this.loadStudents();
    }
  }
  get classkey(): string {
    return this._classkey;
  }
  private _classkey: string = '';
  async uploadStudents() {
    const modal = await this.$modalController.create({
      component: UploadStudentsComponent,
      componentProps: {
        classkey: this.classkey
      }
    });
    await modal.present();
  }
  async newEvaluation(studentKey: string) {
    const teacher = await this.$users.getLoggedUser()
    console.log('🔄 ListStudent4classComponent - newEvaluation');
    this.router.navigate(['/evaluation', studentKey, this.classkey, teacher?.key]);
  }

  deleteStudent(arg0: string) {
    throw new Error('Method not implemented.');
  }
  editStudent(arg0: string) {
    this.router.navigate(['/user-dialog', arg0]);
  }

  readonly _students = signal<UserModel[]>([]);
  readonly studentAverages = signal<Map<string, number>>(new Map());
  readonly filterType = signal<string>('all');
  readonly subjects = signal<SubjectModel[]>([]);
  readonly selectedSubjectKey = signal<string>('all');

  constructor(
    private $users: UsersService,
    private $evaluations: EvaluationService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private $modalController: ModalController,
    private route: ActivatedRoute
  ) {
    console.log("constructor ListStudent4classComponent#");
    addIcons({
      cloudupload: cloudUploadOutline,
      add,
      calendar: calendarOutline
    });

    // Re-load averages whenever subjectKey, classKey or dataInizioPeriodo changes
    effect(() => {
      const classKey = this.classkey;
      const subjectKey = this.selectedSubjectKey();
      const date = this.dataInizioPeriodo();
      if (classKey) {
        this.loadAveragesForStudents();
      }
    });
  }

  filteredStudents = computed(() => {
    const students = this._students();
    const averages = this.studentAverages();
    const filter = this.filterType();

    let filtered = students;

    if (filter === 'insufficient') {
      filtered = students.filter(s => {
        const avg = averages.get(s.key);
        return avg !== undefined && avg < 6;
      });
    } else if (filter === 'sufficient') {
      filtered = students.filter(s => {
        const avg = averages.get(s.key);
        return avg !== undefined && avg >= 6;
      });
    }

    const makeFullName = (user: UserModel) => `${user.lastName} ${user.firstName}`;
    return filtered.sort((a, b) => makeFullName(a).localeCompare(makeFullName(b)));
  });

  get students(): UserModel[] {
    return this._students();
  }

  onDateChange(event: any) {
    const newDate = event.detail.value;
    this.dataInizioPeriodo.set(newDate);
    localStorage.setItem('dataInizioPeriodo', newDate);
  }

  private setStudents(users: UserModel[]): void {
    console.log("setStudents", users);
    this._students.set(users);
  }

  async ngOnInit() {
    const teacher = await this.$users.getLoggedUser();
    if (teacher) {
      console.log("teacher key# in listStudent4class", teacher.key)
      this.teacherkey.set(teacher.key);

      if (this.classkey) {
        const teacherSubjects = await this.$users.getSubjectsByTeacherAndClass(teacher.key, this.classkey);
        this.subjects.set(teacherSubjects);
      }
    }
    if (this.classkey) {
      this.loadStudents();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['classkey'] && !changes['classkey'].firstChange) {
      this.loadStudents();
    }
  }

  private loadStudents() {
    this.$users.getUsersByClass(this.classkey, (users: UserModel[]) => {
      this.setStudents(users);
      this.loadAveragesForStudents();
    });
  }

  private loadAveragesForStudents() {
    const users = this._students();
    const teacherKey = this.teacherkey();
    const subjectKey = this.selectedSubjectKey() === 'all' ? undefined : this.selectedSubjectKey();
    const startDate = this.dataInizioPeriodo();

    if (!teacherKey) return;

    users.forEach(student => {
      this.$evaluations.fetchAverageGrade4StudentAndTeacher(
        student.key,
        teacherKey,
        (average) => {
          this.studentAverages.update(map => {
            const newMap = new Map(map);
            newMap.set(student.key, average);
            return newMap;
          });
        },
        subjectKey,
        startDate
      );
    });
  }

}
