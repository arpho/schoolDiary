import {
  Component,
  OnInit,
  signal,
  input,
  computed,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonTextarea,
  IonButton,
  IonTabs,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonBackButton
} from '@ionic/angular/standalone';
import {
  CommonModule
} from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ClassiService,
  } from '../services/classi.service';
import { ClasseModel } from '../models/classModel';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ListStudent4classComponent } from '../components/list-student4class/list-student4class.component';
import { Evaluation } from 'src/app/pages/evaluations/models/evaluation';
import { ReservedNotes4ClassesComponent } from '../components/reserved-notes4classes/reserved-notes4classes.component';
import { ListActivities4classComponent } from  "../components/listActivities4class/list-activities4class/list-activities4class.component"
import { UsersService } from 'src/app/shared/services/users.service';
import { GroupsManagerComponent } from '../components/groups-manager/groups-manager.component';
import { StudentsWithPdPComponent } from '../components/students-with-pd-p/students-with-pd-p.component';
@Component({
  selector: 'app-classe-dialog',
  templateUrl: './classe-dialog.html',
  styleUrls: ['./classe-dialog.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonInput,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonTextarea,
    IonBackButton,
    IonTabs,
    IonTab,
    IonTabBar,
    IonTabButton,
    IonLabel,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ListStudent4classComponent,
    ReservedNotes4ClassesComponent,
    ListActivities4classComponent,
    GroupsManagerComponent,
    StudentsWithPdPComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClasseDialogPage implements OnInit {
  // Gestione tab attivo
  selectedTab: string = 'generalita';
  
  // Metodo per cambiare tab
  setSelectedTab(tab: string) {
    console.log('Tab selezionato:', tab);
    this.selectedTab = tab;
  }

  classkey = signal<string>('');
  classe = signal<ClasseModel>(new ClasseModel({}));
  teacherkey = signal<string>('');
  formClass = new FormGroup({
    classe: new FormControl('', Validators.required),
    year: new FormControl('', Validators.required),
    coordinatore: new FormControl('', Validators.required),
    segretario: new FormControl('', Validators.required),
    descrizione: new FormControl('', Validators.required),
    note: new FormControl('', Validators.required),
  });
  isEditMode: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private service: ClassiService,
    private route: ActivatedRoute,
    private toaster: ToasterService,
    private $users:UsersService
  ) {
    // Initialize with empty model
    this.classe.set(new ClasseModel({
      year: '',
      classe: '',
      descrizione: '',
      note: ''
    }));
  }
  async ngOnInit(): Promise<void> {
    const user = await this.$users.getLoggedUser();
    if (user && typeof user === 'object' && 'key' in user) {

      this.teacherkey.set(user.key);
    }
    console.log("ngOnInit classe dialog**")
    const classkey = this.route.snapshot.paramMap.get('classkey');
    console.log("classkey**", classkey);
    if(classkey){
    this.classkey.set(classkey);
    }
  
    if (classkey) {
      if (this.classkey()) {
        this.isEditMode = true;
        const editingClasse = await this.service.fetchClasse(this.classkey()!);
        console.log("editingClasse *", editingClasse)
        this.classe.set(editingClasse);
        this.formClass.setValue({
          classe: editingClasse.classe,
          year: editingClasse.year,
          coordinatore: editingClasse.coordinatore,
          segretario: editingClasse.segretario,
          descrizione: editingClasse.descrizione,
          note: editingClasse.note
        });
        console.log("editingClasse", this.classe());

      }
    }
  }

  async save() {
    // Crea una nuova istanza con i valori della form
    const classeObj = new ClasseModel(this.formClass.value).setKey(this.classkey()!);
    console.log("saving classeObj", classeObj);
    try {
      if(this.classkey()){
        await this.service.updateClasse(this.classkey()!, classeObj);
      }else{
        await this.service.addClasse(classeObj);
      }
      const toasTest = this.classkey() ? "Classe aggiornata con successo" : "Classe aggiunta con successo";
      this.toaster.presentToast({message:toasTest,duration:2000,position:"bottom"});

    } catch (error) {
      this.toaster.presentToast({message:"Errore durante l'aggiornamento della classe",duration:2000,position:"bottom"});
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
