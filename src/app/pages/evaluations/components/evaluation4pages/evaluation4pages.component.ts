import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';
import { Evaluation } from '../../models/evaluation';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { QueryFieldFilterConstraint } from 'firebase/firestore';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { filter, save } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButton,
  IonList,
  IonTextarea,
  IonFab,
  IonFabButton,
  IonIcon,
  IonBackButton,
  IonNote,
  ModalController
} from '@ionic/angular/standalone';
import { User } from 'firebase/auth';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { Grids } from 'src/app/shared/models/grids';
import { GridsService } from 'src/app/shared/services/grids/grids.service';
import { EvaluateGridComponent } from '../evaluateGrid/evaluate-grid/evaluate-grid.component';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ActivityDialogComponent } from 'src/app/pages/activities/components/activityDialog/activity-dialog/activity-dialog.component';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';
@Component({
  selector: 'app-evaluation4pages',
  templateUrl: './evaluation4pages.component.html',
  styleUrls: ['./evaluation4pages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [

    FormsModule,
    ReactiveFormsModule,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonButton,
    IonList,
    IonTextarea,
    IonFab,
    IonFabButton,
    IonIcon,
    IonBackButton,
    IonNote,
    EvaluateGridComponent
  ]
})
export class Evaluation4pagesComponent implements OnInit {
  studentKey = signal<string>("");
  classKey = signal<string>("");
  teacherKey = signal<string>("");
  activities = signal<ActivityModel[]>([]);
  title = signal('');
  grid = signal<Grids>(new Grids());
  griglie = signal<Grids[]>([]);
  student = signal<UserModel>(new UserModel());
  subjects = signal<SubjectModel[]>([]);
  isGridValid = signal<boolean>(false);
  $users = inject(UsersService);
  // Inizializzo il form nel costruttore invece che nella dichiarazione
  evaluationform!: FormGroup;
  $evaluations = inject(EvaluationService);
  private $toaster = inject(ToasterService);
  // Inizializza il form
  private initializeForm() {
    this.evaluationform = this.fb.group({
      description: [''],
      note: [''],
      data: [new Date().toISOString()],
      grid: [''],
      activityKey: [''],
      subjectKey: [''],
      classKey: [this.classKey],
      studentKey: [this.studentKey]
    }, { validators: [this.gridValidator()] });
  }
  constructor(private route: ActivatedRoute,
    private fb: FormBuilder,
    private $activites: ActivitiesService,
    private gridsService: GridsService,
    private modalCtrl: ModalController,
    private $classes: ClassiService,
    private router: Router
  ) {
    addIcons({
      save,
    });
    this.initializeForm();
    this.gridsService.getGridsOnRealtime((grids: Grids[]) => {
      console.log("grids", grids);
      this.griglie.set(grids);
    });
  }



  async ngOnInit() {
    const classKey = this.route.snapshot.paramMap.get('classKey');
    const studentKey = this.route.snapshot.paramMap.get('studentKey');
    const teacherKey = this.route.snapshot.paramMap.get('teacherKey');
    console.log(classKey, studentKey, teacherKey);
    this.classKey.set(classKey!);
    this.studentKey.set(studentKey!);
    this.teacherKey.set(teacherKey!);
    this.$activites.getActivities4teacherOnRealtime(teacherKey!, (activities: ActivityModel[]) => {
      console.log("activities", activities);
      this.activities.set(activities);
    }, [new QueryCondition("classKey", "==", classKey!)]);
    const student = await this.$users.getUser(studentKey!);
    if (student != null) {
      this.student.set(student);
      this.title.set("Valutazione studente " + student.lastName + " " + student.firstName);
    }

    if (teacherKey && classKey) {
      const teacherSubjects = await this.$users.getSubjectsByTeacherAndClass(teacherKey, classKey);
      this.subjects.set(teacherSubjects);
      if (teacherSubjects.length > 0) {
        this.evaluationform.patchValue({ subjectKey: teacherSubjects[0].key });
      }
    }

    this.evaluationform.controls['grid'].valueChanges.subscribe((gridKey: string | null) => {
      if (gridKey) {
        const grid = this.griglie().find((grid) => grid.key === gridKey);
        if (grid) {
          this.grid.set(grid);
        }
      }
    });
    this.evaluationform.controls['activityKey'].valueChanges.subscribe((activityKey: string | null) => {
      if (activityKey) {
        const activity = this.activities().find((activity) => activity.key === activityKey);
        if (activity) {
          console.log("activity", activity);
          this.evaluationform.controls['description'].setValue(activity.title);
        }
      }
    });


  }
  async openActivityDialog() {
    const teacher = await this.$users.fetchUserOnCache(this.teacherKey());
    
    let classi: ClasseModel[] = [];
    if (teacher?.classes) {
      const classKeys = teacher.classesKey;
      classi = (await Promise.all(
        classKeys.map(classKey => this.$classes.fetchClasseOnCache(classKey))
      )).filter((classe: ClasseModel | undefined): classe is ClasseModel => classe !== undefined);
    }

    const activity = signal<ActivityModel>(
      new ActivityModel({
        teacherKey: teacher?.key,
        classKey: this.classKey(),
        date: new Date().toISOString()
      })
    );

    const modal = await this.modalCtrl.create({
      component: ActivityDialogComponent,
      componentProps: {
        listaClassi: classi,
        activity: activity,
        selectedClass: this.classKey()
      },
      cssClass: 'auto-height',
      backdropDismiss: false,
      showBackdrop: true,
      mode: 'ios',
      initialBreakpoint: 0.9,
      breakpoints: [0, 0.5, 0.9]
    });

    await modal.present();

    const result = await modal.onDidDismiss();
    if (result.data) {
      const activity = new ActivityModel(result.data);
      const newActivity = await this.$activites.addActivity(activity);
      this.activities.set([...this.activities(), newActivity]);
      this.evaluationform.patchValue({
        activityKey: newActivity.key
      });
      this.evaluationform.updateValueAndValidity();
    }
  }
  async saveEvaluation() {
    const evaluation = new Evaluation(this.evaluationform.value);
    evaluation.classKey = this.classKey();
    evaluation.studentKey = this.studentKey();
    evaluation.teacherKey = this.teacherKey();
    evaluation.grid = this.grid();
    const evaluationKey = (await this.$evaluations.addEvaluation(evaluation)).id;
    this.$toaster.presentToast({ message: 'Valutazione salvata con successo', position: 'top' });
    this.router.navigate(['/pdf-evaluation', evaluationKey]);


  }


  // Validatore personalizzato per la griglia
  private gridValidator() {
    return (control: any) => {
      if (!(control instanceof FormGroup)) return null;

      const gridControl = control.get('grid');
      if (gridControl?.value && !this.isGridValid()) {
        return { gridInvalid: true };
      }
      return null;
    };
  }
  openFilterPopup() {
    console.log("openFilterPopup");
  }

  onGridValidityChange(isValid: boolean) {
    this.isGridValid.set(isValid);
    // Forza il ricalcolo della validità del form
    this.evaluationform.updateValueAndValidity();
  }

}
