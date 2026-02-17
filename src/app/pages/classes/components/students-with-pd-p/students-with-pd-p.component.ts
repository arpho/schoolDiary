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
  ActionSheetController
} from '@ionic/angular/standalone';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  create,
  ellipsisVertical,
  sparkles,
  close,
  trash,
  eye,
  add,
  calendarOutline,
  trendingUp,
  archive
} from 'ionicons/icons';
/**
 * Componente per visualizzare gli studenti con PDP/BES/DSA/ADHD.
 * Filtra automaticamente gli studenti della classe che hanno queste segnalazioni.
 */
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
export class StudentsWithPdPComponent implements OnInit {
  private router = inject(Router);
  private actionSheetController = inject(ActionSheetController);
  private $users = inject(UsersService);

  classe = input<ClasseModel>(new ClasseModel());
  students = signal<UserModel[]>([]);
  teacherKey = signal<string>('');

  constructor() {
    addIcons({
      create,
      'ellipsis-vertical': ellipsisVertical,
      sparkles,
      close,
      trash,
      eye,
      add,
      calendar: calendarOutline,
      'trending-up': trendingUp,
      archive
    });

    effect(() => {
      console.log("studentsWithPdPComponent", this.classe());
      const classeKey = this.classe().key;
      if (classeKey) {
        this.$users.getUsersOnRealTime((users: UserModel[]) => {
          console.log("students with pdp", users);
          this.students.set(users);
        }, [new QueryCondition('classKey', '==', classeKey)],
          new OrCondition([
            new QueryCondition('DVA', '==', true),
            new QueryCondition('BES', '==', true),
            new QueryCondition('DSA', '==', true),
            new QueryCondition('ADHD', '==', true),
          ]))
      }
    });

    this.$users.getLoggedUser().then(user => {
      if (user) this.teacherKey.set(user.key);
    });
  }

  formName(user: UserModel) {
    console.log("formName", user);
    return `${user.lastName} ${user.firstName}`;
  }

  async ngOnInit() {
    console.log('ngOnInit chiamato');
  }

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
          text: 'Progressi',
          icon: 'trending-up',
          handler: () => {
            this.goToProgress(student.key);
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
          text: 'Annulla',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });

    await actionSheet.present();
  }

  goToProgress(studentKey: string) {
    // Defaulting to 'all' subjects as this component doesn't have a subject selector
    const subject = 'all';
    this.router.navigate(['/progress', studentKey, subject]);
  }

  editStudent(studentKey: string) {
    this.router.navigate(['/user-dialog', studentKey]);
  }

  async newEvaluation(studentKey: string) {
    console.log('🔄 StudentsWithPdPComponent - newEvaluation');
    const teacherKey = this.teacherKey();
    const classKey = this.classe().key;
    if (teacherKey && classKey) {
      this.router.navigate(['/evaluation', studentKey, classKey, teacherKey]);
    } else {
      console.error('Missing teacherKey or classKey');
    }
  }
}
